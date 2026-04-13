import sqlite3 from 'sqlite3';
import bcryptjs from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, '..', 'flowerfly.db');
let dbInstance = null;

export const initDB = () => {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
        reject(err);
      } else {
        console.log('✅ Conectado ao banco de dados SQLite');
        // Enable WAL mode for better concurrency
        db.run('PRAGMA journal_mode=WAL', (err) => {
          if (err) console.warn('Aviso ao ativar WAL:', err);
          dbInstance = db;
          createTables(db, resolve, reject);
        });
      }
    });
  });
};

export const getDB = () => {
  return Promise.resolve(dbInstance ||
    new sqlite3.Database(DB_PATH));
};

const createTables = (db, resolve, reject) => {
  db.serialize(() => {
    // Tabela: Users
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        avatar TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabela: Categories
    db.run(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        description TEXT,
        icon TEXT
      )
    `);

    // Tabela: Products
    db.run(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        category_id INTEGER NOT NULL,
        image TEXT,
        stock INTEGER DEFAULT 0,
        rating_avg REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(category_id) REFERENCES categories(id)
      )
    `);

    // Tabela: Reviews
    db.run(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(product_id) REFERENCES products(id),
        FOREIGN KEY(user_id) REFERENCES users(id)
      )
    `);

    // Tabela: Favorites
    db.run(`
      CREATE TABLE IF NOT EXISTS favorites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, product_id),
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(product_id) REFERENCES products(id)
      )
    `);

    // Tabela: Orders
    db.run(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        total_price REAL NOT NULL,
        status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'paid', 'shipped', 'delivered')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )
    `);

    // Tabela: Password Reset Tokens
    db.run(`
      CREATE TABLE IF NOT EXISTS password_resets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        token TEXT UNIQUE NOT NULL,
        expires_at DATETIME NOT NULL,
        used INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )
    `);

    // Tabela: Order Items
    db.run(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        price_at_purchase REAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(order_id) REFERENCES orders(id),
        FOREIGN KEY(product_id) REFERENCES products(id)
      )
    `);

    // Tabela: Search Tags (para busca inteligente)
    db.run(`
      CREATE TABLE IF NOT EXISTS search_tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        tag TEXT NOT NULL,
        priority INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(product_id, tag),
        FOREIGN KEY(product_id) REFERENCES products(id)
      )
    `);

    // Tabela: Coupons
    db.run(`
      CREATE TABLE IF NOT EXISTS coupons (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('percentage', 'fixed')),
        value REAL NOT NULL,
        min_order_value REAL DEFAULT 0,
        max_discount REAL,
        usage_limit INTEGER DEFAULT NULL,
        usage_count INTEGER DEFAULT 0,
        category_id INTEGER DEFAULT NULL,
        product_id INTEGER DEFAULT NULL,
        active INTEGER DEFAULT 1,
        expires_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(category_id) REFERENCES categories(id),
        FOREIGN KEY(product_id) REFERENCES products(id)
      )
    `, (err) => {
      if (err) {
        console.error('Erro ao criar tabelas:', err);
        reject(err);
      } else {
        console.log('✅ Tabelas criadas com sucesso!');
        runMigrations(db, () => seedData(db, resolve, reject), reject);
      }
    });
  });
};

// Migrations para colunas novas em tabelas existentes
const runMigrations = (db, onSuccess, onError) => {
  const migrations = [
    "ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'customer'",
    "ALTER TABLE orders ADD COLUMN coupon_id INTEGER REFERENCES coupons(id)",
    "ALTER TABLE orders ADD COLUMN discount_amount REAL DEFAULT 0",
    // Payment integration columns
    "ALTER TABLE orders ADD COLUMN payment_method TEXT",
    "ALTER TABLE orders ADD COLUMN payment_id TEXT",
    "ALTER TABLE orders ADD COLUMN payment_status TEXT DEFAULT 'pending'",
    "ALTER TABLE orders ADD COLUMN payment_detail TEXT",
    "ALTER TABLE orders ADD COLUMN pix_qr_code TEXT",
    "ALTER TABLE orders ADD COLUMN pix_qr_code_text TEXT",
    "ALTER TABLE orders ADD COLUMN pix_expiration DATETIME",
    "ALTER TABLE orders ADD COLUMN installments INTEGER DEFAULT 1",
    "ALTER TABLE orders ADD COLUMN stock_reserved INTEGER DEFAULT 0",
  ];

  let completed = 0;
  migrations.forEach((sql) => {
    db.run(sql, (err) => {
      // Ignorar erro de coluna duplicada
      if (err && !err.message.includes('duplicate column')) {
        console.warn('Migration warning:', err.message);
      }
      completed++;
      if (completed === migrations.length) {
        console.log('✅ Migrations executadas!');
        onSuccess();
      }
    });
  });
};

const seedData = (db, resolve, reject) => {
  // Inserir categorias
  const categories = [
    { name: 'Girassois', description: 'Girassois frescos e vibrantes' },
    { name: 'Orquideas', description: 'Orquideas exoticas e elegantes' },
    { name: 'Rosas', description: 'Rosas classicas para todas as ocasioes' },
    { name: 'Suculentas', description: 'Suculentas decorativas e duradouras' },
    { name: 'Tulipas', description: 'Tulipas coloridas importadas' },
    { name: 'Lirios', description: 'Lirios brancos e perfumados' },
    { name: 'Margaridas', description: 'Margaridas alegres e delicadas' },
    { name: 'Flores do Campo', description: 'Arranjos com flores do campo e silvestres' },
    { name: 'Astromelias', description: 'Astromelias coloridas e duradouras' },
    { name: 'Lisianthus', description: 'Lisianthus elegantes e sofisticados' },
    { name: 'Crisantemos', description: 'Crisantemos em diversas cores e formas' }
  ];

  categories.forEach((cat) => {
    db.run('INSERT OR IGNORE INTO categories (name, description) VALUES (?, ?)',
      [cat.name, cat.description]);
  });

  // Inserir produtos - flores reais do catalogo Veratine
  const products = [
    // === Girassois (category 1) ===
    { name: 'Buque de Girassois em Kraft', description: 'Buque de girassois com folhagens verdes em papel kraft artesanal', price: 99.90, categoryId: 1, image: '/images/products/girassol1.jpg', rating: 4.8 },
    { name: 'Girassois com Mosquitinho', description: 'Buque de girassois com mosquitinho em papel branco elegante', price: 109.90, categoryId: 1, image: '/images/products/girassol2.jpg', rating: 4.7 },
    { name: 'Girassois e Margaridas', description: 'Buque misto de girassois com margaridas e eucalipto, laco branco', price: 119.90, categoryId: 1, image: '/images/products/girassol3.jpg', rating: 4.9 },
    { name: 'Mini Girassois em Kraft', description: 'Buque de mini girassois e rudbeckia em papel kraft', price: 79.90, categoryId: 1, image: '/images/products/girassol4.jpg', rating: 4.6 },
    { name: 'Girassois Grande Luxo', description: 'Buque grande de girassois em papel verde oliva com laco dourado', price: 149.90, categoryId: 1, image: '/images/products/girassol5.jpg', rating: 4.9 },
    { name: 'Girassois em Vaso Verde', description: 'Arranjo de girassois em vaso de vidro verde sobre balcao', price: 129.90, categoryId: 1, image: '/images/products/girassol6.jpg', rating: 4.7 },
    { name: 'Girassois com Gramineas', description: 'Buque simples de girassois com gramineas decorativas e laco branco', price: 89.90, categoryId: 1, image: '/images/products/girassol7.jpg', rating: 4.5 },
    { name: 'Arranjo Grande de Girassois', description: 'Arranjo grande de girassois em vaso de vidro com laco branco', price: 159.90, categoryId: 1, image: '/images/products/girassol8.jpg', rating: 4.8 },
    { name: 'Girassois e Margaridas no Vaso', description: 'Arranjo de girassois com margaridas em vaso de vidro', price: 119.90, categoryId: 1, image: '/images/products/girassol9.jpg', rating: 4.7 },
    { name: 'Mini Girassol com Mosquitinho', description: 'Mini arranjo de girassol com mosquitinho em garrafa de vidro', price: 59.90, categoryId: 1, image: '/images/products/girassol10.jpg', rating: 4.6 },

    // === Orquideas (category 2) ===
    { name: 'Orquidea Phalaenopsis Branca', description: 'Orquidea Phalaenopsis branca com centros amarelos, elegante e classica', price: 129.90, categoryId: 2, image: '/images/products/orquidea1.jpg', rating: 4.9 },
    { name: 'Orquidea Rosa Cascata', description: 'Orquideas Phalaenopsis rosa abundantes em vaso ceramico claro', price: 159.90, categoryId: 2, image: '/images/products/orquidea2.jpg', rating: 4.8 },
    { name: 'Orquidea Amarela em Vidro', description: 'Orquideas Phalaenopsis amarelas em vaso de vidro sobre pedestal', price: 149.90, categoryId: 2, image: '/images/products/orquidea3.jpg', rating: 4.9 },
    { name: 'Orquidea Branca Multi-Hastes', description: 'Orquideas brancas com centros amarelos em multiplas hastes altas', price: 139.90, categoryId: 2, image: '/images/products/orquidea4.jpg', rating: 4.7 },
    { name: 'Orquidea Cymbidium Burgundy', description: 'Orquideas Cymbidium burgundy escuras com labelo creme e dourado', price: 179.90, categoryId: 2, image: '/images/products/orquidea5.jpg', rating: 4.9 },
    { name: 'Orquidea Azul em Vaso Branco', description: 'Orquideas Phalaenopsis azuis em vaso ceramico branco canelado', price: 169.90, categoryId: 2, image: '/images/products/orquidea6.jpg', rating: 4.6 },
    { name: 'Orquidea Amarela e Rosa', description: 'Orquideas Phalaenopsis amarelas com centros magenta em vaso bege', price: 139.90, categoryId: 2, image: '/images/products/orquidea7.jpg', rating: 4.7 },
    { name: 'Orquidea Cymbidium Vermelha', description: 'Orquideas Cymbidium vermelhas vibrantes em cascata densa', price: 189.90, categoryId: 2, image: '/images/products/orquidea8.jpg', rating: 4.8 },
    { name: 'Buque de Orquideas Rosa', description: 'Buque estilo noiva de orquideas Cymbidium rosa delicadas', price: 199.90, categoryId: 2, image: '/images/products/orquidea9.jpg', rating: 4.9 },
    { name: 'Buque Misto de Orquideas', description: 'Buque de orquideas em tons rosa, branco e lavanda em papel elegante', price: 169.90, categoryId: 2, image: '/images/products/orquidea10.jpg', rating: 4.8 },

    // === Rosas (category 3) ===
    { name: 'Buque de Rosas Rosa', description: 'Buque de rosas rosa com mosquitinho e folhagens em papel kraft', price: 109.90, categoryId: 3, image: '/images/products/rosas1.jpg', rating: 4.8 },
    { name: 'Rosas Rosa Elegantes', description: 'Grande buque de rosas rosa claro em papel branco com fita delicada', price: 139.90, categoryId: 3, image: '/images/products/rosas2.jpg', rating: 4.9 },
    { name: 'Rosas Mistas com Spray', description: 'Buque misto de rosas pessego com mini rosas laranja em kraft', price: 149.90, categoryId: 3, image: '/images/products/rosas3.jpg', rating: 4.7 },
    { name: 'Rosas Laranjas Vintage', description: 'Buque de rosas laranjas vibrantes em papel jornal vintage', price: 119.90, categoryId: 3, image: '/images/products/rosas4.jpg', rating: 4.6 },
    { name: 'Rosas Amarelas Garden', description: 'Buque de rosas amarelas estilo peonia em juta natural', price: 129.90, categoryId: 3, image: '/images/products/rosas5.jpg', rating: 4.8 },
    { name: 'Rosas Amarelas com Margaridas', description: 'Buque de rosas amarelas com margaridas brancas e folhagens', price: 99.90, categoryId: 3, image: '/images/products/rosas6.jpg', rating: 4.5 },
    { name: 'Rosas Bicolor The Botanist', description: 'Buque de rosas bicolor rosa e creme em embalagem The Botanist', price: 159.90, categoryId: 3, image: '/images/products/rosas7.jpg', rating: 4.9 },

    // === Suculentas/Cactos (category 4) ===
    { name: 'Cacto Cereus Decorativo', description: 'Cacto colunar com espinhos marrons em vaso ceramico verde menta', price: 59.90, categoryId: 4, image: '/images/products/cacto1.jpg', rating: 4.5 },
    { name: 'Cacto Colunar em Terracota', description: 'Cacto colunar alto com espinhos amarelos em vaso de terracota', price: 69.90, categoryId: 4, image: '/images/products/cacto2.jpg', rating: 4.4 },
    { name: 'Cacto Florido Rosa', description: 'Cacto redondo com flores rosa e brancas delicadas em vaso branco', price: 79.90, categoryId: 4, image: '/images/products/cacto3.jpg', rating: 4.8 },
    { name: 'Arranjo de Suculentas Coloridas', description: 'Arranjo de suculentas em laranja, roxo, verde e vermelho em terracota', price: 89.90, categoryId: 4, image: '/images/products/cacto4.jpg', rating: 4.7 },
    { name: 'Jardim de Suculentas e Cactos', description: 'Mini jardim com cactos e suculentas variados em vaso ceramico', price: 99.90, categoryId: 4, image: '/images/products/cacto5.jpg', rating: 4.6 },
    { name: 'Suculentas Floridas', description: 'Arranjo de suculentas verdes e rosadas com flores laranja em vaso branco', price: 79.90, categoryId: 4, image: '/images/products/cacto6.jpg', rating: 4.7 },
    { name: 'Suculentas em Vaso de Vidro', description: 'Suculentas verdes e vermelhas em vaso de vidro facetado', price: 69.90, categoryId: 4, image: '/images/products/cacto7.jpg', rating: 4.5 },
    { name: 'Suculenta em Terrario', description: 'Suculenta verde em terrario de vidro redondo com terra escura', price: 54.90, categoryId: 4, image: '/images/products/cacto8.jpg', rating: 4.6 },
    { name: 'Terrario Geometrico', description: 'Terrario geometrico dourado com suculentas e pedrinhas brancas', price: 109.90, categoryId: 4, image: '/images/products/cacto9.jpg', rating: 4.8 },
    { name: 'Terrario Aberto com Suculentas', description: 'Vaso de vidro aberto com suculentas, musgo e pedrinhas decorativas', price: 89.90, categoryId: 4, image: '/images/products/cacto10.jpg', rating: 4.7 },

    // === Tulipas (category 5) ===
    { name: 'Tulipas Coloridas em Kraft', description: 'Buque vibrante de tulipas coloridas em papel kraft marrom', price: 89.90, categoryId: 5, image: '/images/products/tulipas1.jpg', rating: 4.7 },
    { name: 'Tulipas Rosa e Laranja', description: 'Buque rustico de tulipas rosa, roxas e laranja sobre juta', price: 79.90, categoryId: 5, image: '/images/products/tulipas2.jpg', rating: 4.6 },
    { name: 'Tulipas Magenta e Brancas', description: 'Buque compacto de tulipas magenta e brancas em kraft estampado', price: 84.90, categoryId: 5, image: '/images/products/tulipas3.jpg', rating: 4.5 },
    { name: 'Tulipas Rosa Elegantes', description: 'Buque elegante de tulipas rosa e brancas com waxflower e fita rosa', price: 109.90, categoryId: 5, image: '/images/products/tulipas4.jpg', rating: 4.8 },
    { name: 'Tulipas Pessego com Eucalipto', description: 'Buque minimalista de tulipas pessego com eucalipto em papel creme', price: 94.90, categoryId: 5, image: '/images/products/tulipas5.jpg', rating: 4.7 },
    { name: 'Tulipas Azuis com Rosas', description: 'Buque delicado de tulipas azuis com rosas brancas e hortensias', price: 129.90, categoryId: 5, image: '/images/products/tulipas6.jpg', rating: 4.9 },
    { name: 'Tulipas Multicoloridas Premium', description: 'Grande buque de tulipas multicoloridas com mais de 50 hastes', price: 179.90, categoryId: 5, image: '/images/products/tulipas7.jpg', rating: 4.9 },

    // === Lirios (category 6) ===
    { name: 'Lirios Vermelhos com Mosquitinho', description: 'Buque de lirios vermelhos com mosquitinho em papel kraft', price: 99.90, categoryId: 6, image: '/images/products/lirios1.jpg', rating: 4.7 },
    { name: 'Lirios Rosa com Rosas', description: 'Buque misto de lirios stargazer rosa com rosas e mosquitinho', price: 119.90, categoryId: 6, image: '/images/products/lirios2.jpg', rating: 4.8 },
    { name: 'Lirios Rosa em Papel', description: 'Buque de lirios orientais rosa vibrantes em papel rosa com fita branca', price: 109.90, categoryId: 6, image: '/images/products/lirios3.jpg', rating: 4.6 },
    { name: 'Lirios Rosa e Rosas Mix', description: 'Buque solto de lirios rosa, rosas e mosquitinho com folhagens', price: 129.90, categoryId: 6, image: '/images/products/lirios4.jpg', rating: 4.7 },
    { name: 'Lirios Magenta com Astromelias', description: 'Buque de lirios magenta com astromelias rosa em papel kraft', price: 114.90, categoryId: 6, image: '/images/products/lirios5.jpg', rating: 4.8 },
    { name: 'Lirios Brancos no Vaso', description: 'Arranjo classico de lirios brancos em vaso de vidro sobre mesa rustica', price: 139.90, categoryId: 6, image: '/images/products/lirios6.jpg', rating: 4.9 },
    { name: 'Lirios Amarelos Premium', description: 'Arranjo abundante de lirios amarelos com eucalipto em vaso de vidro', price: 149.90, categoryId: 6, image: '/images/products/lirios7.png', rating: 4.8 },
    { name: 'Lirios Brancos com Eucalipto', description: 'Buque elegante de lirios brancos com eucalipto e fita de cetim branca', price: 134.90, categoryId: 6, image: '/images/products/lirios8.jpg', rating: 4.9 },

    // === Margaridas (category 7) ===
    { name: 'Margaridas com Flores Azuis', description: 'Buque de margaridas brancas com flores azuis em papel kraft com fita rosa', price: 69.90, categoryId: 7, image: '/images/products/margaridas1.jpg', rating: 4.6 },
    { name: 'Margaridas e Camomilas', description: 'Buque de margaridas grandes e camomilas em papel lavanda', price: 79.90, categoryId: 7, image: '/images/products/margaridas2.jpg', rating: 4.7 },
    { name: 'Margaridas Brancas Premium', description: 'Grande buque redondo de margaridas brancas com centros dourados', price: 89.90, categoryId: 7, image: '/images/products/margaridas3.jpg', rating: 4.8 },
    { name: 'Margaridas Elegantes', description: 'Buque elegante de margaridas com folhagens em papel branco e fita cetim', price: 84.90, categoryId: 7, image: '/images/products/margaridas4.jpg', rating: 4.7 },
    { name: 'Camomilas Delicadas', description: 'Buque denso de camomilas em papel creme com fita de renda', price: 74.90, categoryId: 7, image: '/images/products/margaridas5.jpg', rating: 4.8 },
    { name: 'Margaridas com Perpetuas', description: 'Buque de margaridas brancas com perpetuas vermelhas e fita vermelha', price: 79.90, categoryId: 7, image: '/images/products/margaridas6.jpg', rating: 4.5 },
    { name: 'Margaridas e Flores Roxas', description: 'Grande buque de margaridas com flores roxas e folhagens verdes', price: 94.90, categoryId: 7, image: '/images/products/margaridas7.jpg', rating: 4.7 },
    { name: 'Margaridas no Vaso', description: 'Arranjo de margaridas brancas em vaso de vidro com laco creme', price: 64.90, categoryId: 7, image: '/images/products/margaridas8.jpg', rating: 4.6 },

    // === Flores do Campo (category 8) ===
    { name: 'Buque Silvestre Misto', description: 'Buque silvestre com ranunculos amarelos, margaridas, flores rosas e gramineas', price: 109.90, categoryId: 8, image: '/images/products/floresdocampo1.jpg', rating: 4.8 },
    { name: 'Flores do Campo Coloridas', description: 'Buque colorido de flores do campo em vermelho, rosa, amarelo e laranja em kraft', price: 89.90, categoryId: 8, image: '/images/products/floresdocampo2.jpg', rating: 4.7 },
    { name: 'Buque Outonal Rustico', description: 'Buque rustico com girassois, gerberas, lavanda e flores silvestres em kraft', price: 129.90, categoryId: 8, image: '/images/products/floresdocampo3.jpg', rating: 4.9 },
    { name: 'Calendulas e Campainhas', description: 'Buque de calendulas laranjas, campainhas azuis e flores brancas em jornal vintage', price: 94.90, categoryId: 8, image: '/images/products/floresdocampo4.jpg', rating: 4.6 },
    { name: 'Lavanda e Calendulas', description: 'Buque de lavanda roxa com calendulas laranjas e margaridas em kraft', price: 84.90, categoryId: 8, image: '/images/products/floresdocampo5.jpg', rating: 4.7 },
    { name: 'Gerberas e Delfinios', description: 'Buque de gerberas amarelas com delfinios roxos sobre caixote rustico', price: 99.90, categoryId: 8, image: '/images/products/floresdocampo6.jpg', rating: 4.5 },
    { name: 'Buque Pastoral', description: 'Buque delicado de margaridas, lavanda e tanaceto no parapeito da janela', price: 79.90, categoryId: 8, image: '/images/products/floresdocampo7.jpg', rating: 4.8 },
    { name: 'Buque Campestre Elegante', description: 'Buque elegante de cosmos brancos, flores lilas e gramineas com fita rosa', price: 119.90, categoryId: 8, image: '/images/products/floresdocampo8.jpg', rating: 4.9 },

    // === Astromelias (category 9) ===
    { name: 'Astromelias Brancas no Vaso', description: 'Arranjo de astromelias brancas com folhagens em vaso de vidro', price: 89.90, categoryId: 9, image: '/images/products/astromelia1.jpg', rating: 4.7 },
    { name: 'Buque de Astromelias Rosa', description: 'Buque de astromelias rosa suave seguro a mao', price: 79.90, categoryId: 9, image: '/images/products/astromelia2.jpg', rating: 4.6 },
    { name: 'Astromelias Rosa no Vaso', description: 'Arranjo abundante de astromelias rosa claro em vaso de vidro', price: 99.90, categoryId: 9, image: '/images/products/astromelia3.jpg', rating: 4.8 },
    { name: 'Astromelias Mistas Embaladas', description: 'Buque de astromelias mistas em rosa, coral, lilas e amarelo em papel rose', price: 109.90, categoryId: 9, image: '/images/products/astromelia4.jpg', rating: 4.7 },
    { name: 'Buque Redondo de Astromelias', description: 'Buque compacto de astromelias rosa e brancas ao ar livre', price: 94.90, categoryId: 9, image: '/images/products/astromelia5.jpg', rating: 4.5 },
    { name: 'Astromelias Rosa e Brancas', description: 'Arranjo de astromelias rosa e brancas em vaso de vidro com cortina cinza', price: 89.90, categoryId: 9, image: '/images/products/astromelia6.jpg', rating: 4.6 },
    { name: 'Astromelias Blush Altas', description: 'Arranjo alto de astromelias blush em vaso de vidro em canto branco', price: 104.90, categoryId: 9, image: '/images/products/astromelia7.jpg', rating: 4.7 },
    { name: 'Astromelias Creme e Pessego', description: 'Buque de astromelias creme e pessego em vaso canelado com fita rosa', price: 114.90, categoryId: 9, image: '/images/products/astromelia8.jpg', rating: 4.8 },
    { name: 'Astromelias Laranja e Vermelhas', description: 'Arranjo de astromelias laranja e vermelho queimado em vaso de vidro', price: 99.90, categoryId: 9, image: '/images/products/astromelia9.jpg', rating: 4.7 },
    { name: 'Buque de Astromelias Coral', description: 'Buque redondo de astromelias coral com folhagens em papel pastel', price: 94.90, categoryId: 9, image: '/images/products/astromelia10.jpg', rating: 4.6 },

    // === Lisianthus (category 10) ===
    { name: 'Lisianthus Rosa e Branco', description: 'Buque de lisianthus rosa palido e branco com petalas onduladas', price: 109.90, categoryId: 10, image: '/images/products/lisiantos1.jpg', rating: 4.8 },
    { name: 'Lisianthus Rosa Denso', description: 'Buque denso de lisianthus rosa com botoes verdes', price: 119.90, categoryId: 10, image: '/images/products/lisiantos2.jpg', rating: 4.7 },
    { name: 'Lisianthus Lavanda', description: 'Arranjo de lisianthus lavanda com botoes verdes delicados', price: 114.90, categoryId: 10, image: '/images/products/lisiantos3.jpg', rating: 4.9 },
    { name: 'Lisianthus Lilas em Kraft', description: 'Dois buques de lisianthus lilas embalados em papel kraft', price: 99.90, categoryId: 10, image: '/images/products/lisiantos4.jpg', rating: 4.6 },
    { name: 'Lisianthus Roxo no Vaso', description: 'Lisianthus roxo profundo em vaso de vidro transparente', price: 129.90, categoryId: 10, image: '/images/products/lisiantos5.jpg', rating: 4.8 },
    { name: 'Lisianthus Lavanda Rustico', description: 'Buque de lisianthus lavanda com botoes verdes em fundo de madeira', price: 104.90, categoryId: 10, image: '/images/products/lisiantos6.jpg', rating: 4.5 },
    { name: 'Lisianthus Lavanda Grande', description: 'Grande arranjo de lisianthus lavanda claro em ambiente interno', price: 139.90, categoryId: 10, image: '/images/products/lisiantos7.jpg', rating: 4.7 },
    { name: 'Lisianthus Lavanda Close-up', description: 'Arranjo compacto de lisianthus lavanda com petalas onduladas', price: 109.90, categoryId: 10, image: '/images/products/lisiantos8.jpg', rating: 4.6 },
    { name: 'Lisianthus Roxo Embalado', description: 'Buque redondo e denso de lisianthus roxo em papel lilas', price: 124.90, categoryId: 10, image: '/images/products/lisiantos9.jpg', rating: 4.8 },

    // === Crisantemos (category 11) ===
    { name: 'Crisantemos Brancos Pompom', description: 'Buque de crisantemos brancos tipo pompom, denso e arredondado', price: 74.90, categoryId: 11, image: '/images/products/crisantemos1.jpg', rating: 4.6 },
    { name: 'Crisantemos Brancos e Cravos', description: 'Buque de crisantemos brancos com cravos rosa em papel kraft e fita', price: 84.90, categoryId: 11, image: '/images/products/crisantemos2.jpg', rating: 4.7 },
    { name: 'Crisantemos Rosa Pompom', description: 'Buque de grandes crisantemos rosa pompom com waxflower rosa', price: 89.90, categoryId: 11, image: '/images/products/crisantemos3.jpg', rating: 4.8 },
    { name: 'Crisantemos com Mosquitinho Azul', description: 'Buque de crisantemos brancos com mosquitinho azul em papel azul claro', price: 79.90, categoryId: 11, image: '/images/products/crisantemos4.jpg', rating: 4.5 },
    { name: 'Crisantemos Rosa Claro', description: 'Grande buque de crisantemos rosa claro pompom junto a janela', price: 94.90, categoryId: 11, image: '/images/products/crisantemos5.jpg', rating: 4.7 },
    { name: 'Crisantemos Rosa no Vaso', description: 'Arranjo de crisantemos rosa em vaso de vidro com fita rosa', price: 84.90, categoryId: 11, image: '/images/products/crisantemos6.jpg', rating: 4.6 },
    { name: 'Crisantemos Lilas e Brancos', description: 'Buque de crisantemos brancos e lilas com mosquitinho em papel rosa', price: 89.90, categoryId: 11, image: '/images/products/crisantemos7.jpg', rating: 4.7 },
    { name: 'Crisantemos Lilas Escuro', description: 'Buque de crisantemos lilas com centros roxos em celofane', price: 79.90, categoryId: 11, image: '/images/products/crisantemos8.jpg', rating: 4.5 },
    { name: 'Crisantemos Rosa com Waxflower', description: 'Buque de crisantemos rosa grandes com waxflower rosa', price: 89.90, categoryId: 11, image: '/images/products/crisantemos9.jpg', rating: 4.8 },
    { name: 'Crisantemos Lilas e Brancos Mix', description: 'Buque redondo de crisantemos brancos e lilas em papel rosa', price: 84.90, categoryId: 11, image: '/images/products/crisantemos10.jpg', rating: 4.6 },
  ];

  // Criar usuário admin padrão
  const adminPassword = bcryptjs.hashSync('admin123', 10);
  db.run(
    "INSERT OR IGNORE INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
    ['Administrador', 'admin@veratine.com', adminPassword, 'admin']
  );

  // Criar cupons de exemplo
  const sampleCoupons = [
    { code: 'BEMVINDO10', type: 'percentage', value: 10, min_order_value: 50, max_discount: 30, usage_limit: 100, expires_at: '2027-12-31' },
    { code: 'FRETE20', type: 'fixed', value: 20, min_order_value: 100, max_discount: null, usage_limit: 50, expires_at: '2027-06-30' },
    { code: 'FLORES15', type: 'percentage', value: 15, min_order_value: 80, max_discount: 50, usage_limit: null, expires_at: '2027-12-31' },
  ];
  sampleCoupons.forEach((c) => {
    db.run(
      'INSERT OR IGNORE INTO coupons (code, type, value, min_order_value, max_discount, usage_limit, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [c.code, c.type, c.value, c.min_order_value, c.max_discount, c.usage_limit, c.expires_at]
    );
  });

  // Verificar se ja existem produtos antes de inserir seed
  db.get('SELECT COUNT(*) as count FROM products', (err, row) => {
    if (row && row.count > 0) {
      console.log(`Produtos ja existem (${row.count}). Seed ignorado.`);
      resolve();
      return;
    }
    insertSeedProducts(db, products, resolve);
  });
};

const insertSeedProducts = (db, products, resolve) => {
  let productCount = 0;
  const tagsMap = {
    1: ['girassol', 'buque', 'arranjo', 'amarelo', 'flor'],
    2: ['orquidea', 'elegante', 'sofisticada', 'exotica'],
    3: ['rosa', 'buque', 'romantico', 'classico'],
    4: ['suculenta', 'cacto', 'decorativa', 'interior'],
    5: ['tulipa', 'colorida', 'buque', 'primavera'],
    6: ['lirio', 'buque', 'perfumado', 'elegante'],
    7: ['margarida', 'flor', 'alegre', 'delicada'],
    8: ['flores do campo', 'silvestre', 'rustico', 'buque'],
    9: ['astromelia', 'duradoura', 'colorida', 'arranjo'],
    10: ['lisianthus', 'sofisticado', 'elegante', 'buque'],
    11: ['crisantemo', 'pompom', 'colorido', 'buque']
  };

  products.forEach((prod) => {
    db.run(
      'INSERT OR IGNORE INTO products (name, description, price, category_id, image, stock, rating_avg) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [prod.name, prod.description, prod.price, prod.categoryId, prod.image, 50, prod.rating],
      function(err) {
        if (err) {
          console.error('Erro ao inserir produto:', err);
        } else {
          const productId = this.lastID;
          const tags = tagsMap[prod.categoryId] || [];

          // Adicionar tags relacionadas à categoria
          tags.forEach((tag, index) => {
            db.run(
              'INSERT OR IGNORE INTO search_tags (product_id, tag, priority) VALUES (?, ?, ?)',
              [productId, tag, 5 - index]
            );
          });
        }
        productCount++;
        if (productCount === products.length) {
          console.log('Dados de exemplo carregados!');
          resolve();
        }
      }
    );
  });
};
