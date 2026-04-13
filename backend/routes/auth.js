import express from 'express';
import bcryptjs from 'bcryptjs';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { generateToken, authMiddleware } from '../middleware/auth.js';
import { getDB } from '../db/init.js';
import { sendWelcomeEmail, sendPasswordResetEmail } from '../utils/emailService.js';

const router = express.Router();

// Inicializar cliente OAuth do Google
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// POST /auth/register - Cadastro
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Validações
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Senhas não conferem' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Senha deve ter no mínimo 6 caracteres' });
    }

    const db = await getDB();

    // Verificar se email já existe
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao verificar email' });
      }

      if (user) {
        return res.status(400).json({ error: 'Email já cadastrado' });
      }

      // Hash da senha
      const hashedPassword = await bcryptjs.hash(password, 10);

      // Inserir usuário
      db.run(
        'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
        [name, email, hashedPassword],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Erro ao cadastrar usuário' });
          }

          const token = generateToken(this.lastID);

          // Send welcome email (non-blocking)
          sendWelcomeEmail(email, name).catch(err =>
            console.error('Failed to send welcome email:', err)
          );

          res.status(201).json({
            message: 'Usuário cadastrado com sucesso',
            token,
            user: { id: this.lastID, name, email, role: 'customer' }
          });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// POST /auth/login - Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    const db = await getDB();

    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao buscar usuário' });
      }

      if (!user) {
        return res.status(401).json({ error: 'Email ou senha inválidos' });
      }

      // Verificar senha
      const isValidPassword = await bcryptjs.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Email ou senha inválidos' });
      }

      const token = generateToken(user.id);
      res.json({
        message: 'Login realizado com sucesso',
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role || 'customer' }
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// GET /auth/me - Info do usuário autenticado
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const db = await getDB();

    db.get('SELECT id, name, email, avatar, role FROM users WHERE id = ?', [req.userId], (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao buscar usuário' });
      }

      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      res.json({ user });
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// POST /auth/logout - Logout (apenas para frontend limpar o token)
router.post('/logout', (req, res) => {
  res.json({ message: 'Logout realizado com sucesso' });
});

// POST /auth/google-login - Login com Google
router.post('/google-login', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token do Google é obrigatório' });
    }

    // Validar token do Google
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    const db = await getDB();

    // Buscar ou criar usuário
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao buscar usuário' });
      }

      if (user) {
        // Usuário já existe, fazer login
        const jwtToken = generateToken(user.id);
        return res.json({
          message: 'Login com Google realizado com sucesso',
          token: jwtToken,
          user: { id: user.id, name: user.name, email: user.email, role: user.role || 'customer' }
        });
      }

      // Criar novo usuário
      // Gerar senha aleatória para usuários Google (não será usada)
      const randomPassword = await bcryptjs.hash(Math.random().toString(36), 10);

      db.run(
        'INSERT INTO users (name, email, password, avatar) VALUES (?, ?, ?, ?)',
        [name, email, randomPassword, picture],
        function(err) {
          if (err) {
            console.error('Erro ao criar usuário Google:', err);
            return res.status(500).json({ error: 'Erro ao criar usuário' });
          }

          const jwtToken = generateToken(this.lastID);
          res.status(201).json({
            message: 'Usuário criado e login realizado com sucesso',
            token: jwtToken,
            user: { id: this.lastID, name, email }
          });
        }
      );
    });
  } catch (error) {
    console.error('Erro ao validar token do Google:', error);
    res.status(401).json({ error: 'Token do Google inválido' });
  }
});

// POST /auth/forgot-password - Solicitar redefinição de senha
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email é obrigatório' });
    }

    const db = await getDB();

    db.get('SELECT id, name FROM users WHERE email = ?', [email], (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Erro no servidor' });
      }

      // Sempre retorna sucesso para não revelar se o email existe
      if (!user) {
        return res.json({ message: 'Se o email estiver cadastrado, você receberá um link para redefinir sua senha.' });
      }

      // Gerar token de reset
      const resetToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hora

      // Invalidar tokens anteriores do usuário
      db.run('UPDATE password_resets SET used = 1 WHERE user_id = ?', [user.id], (err) => {
        if (err) console.error('Erro ao invalidar tokens antigos:', err);

        // Salvar novo token
        db.run(
          'INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)',
          [user.id, resetToken, expiresAt],
          (err) => {
            if (err) {
              console.error('Erro ao salvar token de reset:', err);
              return res.status(500).json({ error: 'Erro ao gerar token de redefinição' });
            }

            // Send password reset email (non-blocking)
            sendPasswordResetEmail(email, user.name, resetToken).catch(err =>
              console.error('Failed to send reset email:', err)
            );

            res.json({
              message: 'Se o email estiver cadastrado, você receberá um link para redefinir sua senha.'
            });
          }
        );
      });
    });
  } catch (error) {
    console.error('Erro no forgot-password:', error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// POST /auth/reset-password - Redefinir senha com token
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;

    if (!token || !password || !confirmPassword) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Senhas não conferem' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Senha deve ter no mínimo 6 caracteres' });
    }

    const db = await getDB();

    db.get(
      'SELECT pr.*, u.email FROM password_resets pr JOIN users u ON pr.user_id = u.id WHERE pr.token = ? AND pr.used = 0',
      [token],
      async (err, resetRecord) => {
        if (err) {
          return res.status(500).json({ error: 'Erro no servidor' });
        }

        if (!resetRecord) {
          return res.status(400).json({ error: 'Token inválido ou já utilizado' });
        }

        // Verificar se expirou
        if (new Date(resetRecord.expires_at) < new Date()) {
          return res.status(400).json({ error: 'Token expirado. Solicite um novo link de redefinição.' });
        }

        // Atualizar senha
        const hashedPassword = await bcryptjs.hash(password, 10);

        db.run('UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [hashedPassword, resetRecord.user_id],
          (err) => {
            if (err) {
              return res.status(500).json({ error: 'Erro ao atualizar senha' });
            }

            // Marcar token como usado
            db.run('UPDATE password_resets SET used = 1 WHERE id = ?', [resetRecord.id]);

            res.json({ message: 'Senha redefinida com sucesso! Você já pode fazer login.' });
          }
        );
      }
    );
  } catch (error) {
    console.error('Erro no reset-password:', error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// PUT /auth/update-profile - Atualizar perfil do usuário
router.put('/update-profile', authMiddleware, async (req, res) => {
  try {
    const { name, avatar } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Nome é obrigatório' });
    }

    if (name.trim().length > 100) {
      return res.status(400).json({ error: 'Nome deve ter no máximo 100 caracteres' });
    }

    const db = await getDB();

    db.run(
      'UPDATE users SET name = ?, avatar = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name.trim(), avatar || null, req.userId],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Erro ao atualizar perfil' });
        }

        db.get('SELECT id, name, email, avatar, role FROM users WHERE id = ?', [req.userId], (err, user) => {
          if (err) {
            return res.status(500).json({ error: 'Erro ao buscar usuário atualizado' });
          }

          res.json({
            message: 'Perfil atualizado com sucesso',
            user
          });
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// POST /auth/change-password - Alterar senha
router.post('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Nova senha deve ter no mínimo 6 caracteres' });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ error: 'As senhas não conferem' });
    }

    const db = await getDB();

    db.get('SELECT * FROM users WHERE id = ?', [req.userId], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Erro no servidor' });
      }

      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      const isValidPassword = await bcryptjs.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ error: 'Senha atual incorreta' });
      }

      const hashedPassword = await bcryptjs.hash(newPassword, 10);

      db.run(
        'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [hashedPassword, req.userId],
        (err) => {
          if (err) {
            return res.status(500).json({ error: 'Erro ao alterar senha' });
          }

          res.json({ message: 'Senha alterada com sucesso' });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

export default router;
