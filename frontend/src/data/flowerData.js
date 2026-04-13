import girassolImg from '../assets/girassol.jpg';
import orquideasImg from '../assets/orquideas.jpg';
import rosasImg from '../assets/rosas.jpg';
import suculentasImg from '../assets/suculentas.jpg';
import tulipasImg from '../assets/tulipas.jpg';
import liriosImg from '../assets/lirios.jpg';
import margaridasImg from '../assets/margaridas.jpg';
import floresDoCampoImg from '../assets/flores do campo.jpg';
import astromeliasImg from '../assets/astromelias.jpg';
import lisianthusImg from '../assets/lisianthus.jpg';
import crisantemosImg from '../assets/crisantemos.jpg';

const flowerData = {
  girassois: {
    id: 1,
    slug: 'girassois',
    name: 'Girassol',
    namePlural: 'Girassois',
    heroImage: girassolImg,
    gallery: [girassolImg],
    priceRange: { min: 59.90, max: 189.90 },
    description: {
      origin: 'Originário das Américas, o girassol (Helianthus annuus) foi domesticado por povos indígenas há mais de 3.000 anos. Os espanhóis levaram a planta para a Europa no século XVI, onde se espalhou pelo mundo.',
      characteristics: 'Planta anual que pode atingir até 3 metros de altura. Suas flores grandes e vibrantes seguem o movimento do sol (heliotropismo) quando jovens. Cada "flor" é na verdade composta por centenas de pequenas flores tubulares no centro.',
      curiosities: 'Um único girassol pode conter até 2.000 sementes. Vincent van Gogh imortalizou a flor em sua famosa série de pinturas. O girassol é a flor nacional da Ucrânia.',
    },
    care: {
      water: 'Regar profundamente 1-2 vezes por semana. Manter o solo úmido, mas não encharcado.',
      light: 'Sol pleno — necessita de pelo menos 6-8 horas de luz solar direta por dia.',
      soil: 'Solo bem drenado, rico em matéria orgânica. pH ideal entre 6.0 e 7.5.',
      climate: 'Clima quente a temperado. Temperatura ideal entre 20°C e 30°C. Não tolera geadas.',
      extraTips: 'Em vasos, escolha variedades anãs. Gire o vaso regularmente para crescimento uniforme.',
    },
    symbolism: 'Representa admiração, lealdade e longevidade. É símbolo de felicidade, vitalidade e energia positiva. Na linguagem das flores, presentear alguém com girassóis significa "você ilumina minha vida".',
    seasons: ['Primavera', 'Verão'],
    lifespan: '7 a 12 dias em vaso',
    difficulty: 'Fácil',
  },

  orquideas: {
    id: 2,
    slug: 'orquideas',
    name: 'Orquídea',
    namePlural: 'Orquídeas',
    heroImage: orquideasImg,
    gallery: [orquideasImg],
    priceRange: { min: 89.90, max: 299.90 },
    description: {
      origin: 'As orquídeas existem há mais de 100 milhões de anos. A família Orchidaceae é uma das maiores do reino vegetal, com mais de 35.000 espécies distribuídas em todos os continentes, exceto a Antártida.',
      characteristics: 'Podem ser epífitas (crescem sobre árvores), terrestres ou litófitas (crescem em rochas). Suas flores possuem uma estrutura única com três sépalas e três pétalas, sendo uma delas modificada em labelo.',
      curiosities: 'O Brasil é o terceiro país com mais espécies de orquídeas no mundo. A baunilha é extraída de uma espécie de orquídea (Vanilla planifolia). Algumas orquídeas podem viver mais de 100 anos.',
    },
    care: {
      water: 'Regar 1-2 vezes por semana. Deixar secar levemente entre regas. Nunca deixar água acumular no pratinho.',
      light: 'Luz indireta brilhante. Evitar sol direto que pode queimar as folhas.',
      soil: 'Substrato especial para orquídeas: casca de pinus, carvão vegetal e esfagno.',
      climate: 'Temperatura entre 18°C e 28°C. Umidade relativa acima de 50%.',
      extraTips: 'Adube a cada 15 dias durante a fase de crescimento. Após a floração, corte a haste acima do segundo nó.',
    },
    symbolism: 'Símbolo de luxo, beleza refinada e amor. Na China, representa fertilidade e perfeição. No Japão, simboliza bravura e nobreza. Orquídeas brancas representam pureza; rosas, feminilidade; roxas, admiração.',
    seasons: ['Todo o ano'],
    lifespan: '30 a 90 dias em flor',
    difficulty: 'Intermediário',
  },

  rosas: {
    id: 3,
    slug: 'rosas',
    name: 'Rosa',
    namePlural: 'Rosas',
    heroImage: rosasImg,
    gallery: [rosasImg],
    priceRange: { min: 49.90, max: 349.90 },
    description: {
      origin: 'Cultivadas há mais de 5.000 anos, as rosas são originárias da Ásia. Foram cultuadas por civilizações antigas — gregos, romanos e persas — e levadas para a Europa pelos cruzados.',
      characteristics: 'Arbustos espinhosos da família Rosaceae com mais de 30.000 variedades cultivadas. As flores podem ser simples, semidobradas ou dobradas, em quase todas as cores exceto azul natural.',
      curiosities: 'A rosa mais cara do mundo, a Juliet Rose, custou £3 milhões para ser desenvolvida. A maior roseira do mundo fica no Arizona, EUA, e cobre uma área de 740m². Pétalas de rosa são comestíveis.',
    },
    care: {
      water: 'Regar na base 2-3 vezes por semana. Em vaso com água, trocar a água a cada 2 dias.',
      light: 'Sol pleno, pelo menos 6 horas de luz direta por dia.',
      soil: 'Solo fértil, bem drenado e rico em matéria orgânica. pH entre 6.0 e 6.5.',
      climate: 'Clima temperado a subtropical. Temperatura ideal entre 15°C e 25°C.',
      extraTips: 'Corte os caules em diagonal antes de colocar na água. Remova folhas que ficam submersas.',
    },
    symbolism: 'A rainha das flores. Vermelhas: amor apaixonado. Brancas: pureza e inocência. Rosas: gratidão e carinho. Amarelas: amizade e alegria. Laranja: desejo e entusiasmo.',
    seasons: ['Todo o ano'],
    lifespan: '5 a 14 dias em vaso',
    difficulty: 'Intermediário',
  },

  suculentas: {
    id: 4,
    slug: 'suculentas',
    name: 'Suculenta',
    namePlural: 'Suculentas',
    heroImage: suculentasImg,
    gallery: [suculentasImg],
    priceRange: { min: 19.90, max: 129.90 },
    description: {
      origin: 'Encontradas em todos os continentes, as suculentas evoluíram de forma independente em diversas famílias. As mais populares vêm da África do Sul, México e América Central.',
      characteristics: 'Plantas que armazenam água em suas folhas, caules ou raízes, resultando em partes grossas e carnudas. Existem mais de 10.000 espécies conhecidas em mais de 60 famílias diferentes.',
      curiosities: 'Algumas suculentas podem sobreviver meses sem água. A Echeveria forma rosetas perfeitas que parecem esculturas naturais. Muitas mudam de cor conforme a exposição solar.',
    },
    care: {
      water: 'Regar apenas quando o solo estiver completamente seco — geralmente a cada 7-14 dias. Menos é mais.',
      light: 'Sol direto ou luz indireta muito forte. Mínimo 4-6 horas de luz por dia.',
      soil: 'Solo bem drenado, arenoso. Mistura de terra vegetal com areia grossa ou perlita (proporção 1:1).',
      climate: 'Clima quente e seco. Temperatura ideal entre 18°C e 30°C. Maioria não tolera geadas.',
      extraTips: 'Nunca borrife água nas folhas. Propague facilmente por folhas ou mudas laterais.',
    },
    symbolism: 'Representam persistência, resiliência e amor duradouro. São símbolo de força interior e capacidade de adaptação. Presentear suculentas significa desejar prosperidade.',
    seasons: ['Todo o ano'],
    lifespan: 'Perene — anos com cuidados adequados',
    difficulty: 'Fácil',
  },

  tulipas: {
    id: 5,
    slug: 'tulipas',
    name: 'Tulipa',
    namePlural: 'Tulipas',
    heroImage: tulipasImg,
    gallery: [tulipasImg],
    priceRange: { min: 69.90, max: 199.90 },
    description: {
      origin: 'Originárias da Ásia Central e Turquia, as tulipas foram levadas para a Holanda no século XVI, onde causaram a "Tulipomania" — a primeira bolha especulativa da história, quando bulbos chegaram a valer mais que casas.',
      characteristics: 'Plantas bulbosas da família Liliaceae com flores em forma de cálice. Existem mais de 3.000 variedades registradas em 15 grupos diferentes, com todas as cores exceto azul verdadeiro.',
      curiosities: 'Na Segunda Guerra Mundial, holandeses comiam bulbos de tulipa para sobreviver. As tulipas continuam crescendo depois de cortadas, podendo aumentar até 5cm no vaso. A Holanda exporta mais de 2 bilhões de bulbos por ano.',
    },
    care: {
      water: 'Em vaso: trocar a água a cada 2 dias. No jardim: regar moderadamente, 1 vez por semana.',
      light: 'Sol pleno a meia-sombra. Pelo menos 5 horas de luz por dia.',
      soil: 'Solo bem drenado, neutro a levemente ácido. Plantar bulbos a 15cm de profundidade.',
      climate: 'Clima frio a temperado. Necessitam de período de frio (vernalização) para florescer. Ideal: 10°C a 20°C.',
      extraTips: 'Adicione um centavo de cobre na água do vaso — ajuda a manter as hastes eretas.',
    },
    symbolism: 'Representam amor perfeito e declaração de amor. Vermelhas: amor verdadeiro. Amarelas: alegria e esperança. Roxas: realeza e prosperidade. Brancas: perdão e respeito.',
    seasons: ['Primavera'],
    lifespan: '5 a 10 dias em vaso',
    difficulty: 'Intermediário',
  },

  lirios: {
    id: 6,
    slug: 'lirios',
    name: 'Lírio',
    namePlural: 'Lírios',
    heroImage: liriosImg,
    gallery: [liriosImg],
    priceRange: { min: 79.90, max: 229.90 },
    description: {
      origin: 'Nativos do hemisfério norte, os lírios (Lilium) são cultivados há mais de 3.000 anos. Foram venerados por gregos, romanos e na mitologia cristã. A flor-de-lis francesa é inspirada no lírio.',
      characteristics: 'Plantas bulbosas que podem atingir de 60cm a 2 metros de altura. Flores grandes e perfumadas com 6 tépalas, frequentemente com manchas ou pintas decorativas.',
      curiosities: 'O perfume do lírio é tão intenso que pode causar dor de cabeça em ambientes fechados. São tóxicos para gatos. O lírio-do-vale foi o favorito da Rainha Vitória e de Grace Kelly.',
    },
    care: {
      water: 'Regar moderadamente 2-3 vezes por semana. Manter solo úmido, nunca encharcado.',
      light: 'Sol pleno na base, sombra parcial no topo. Ideal: manhã de sol, tarde protegida.',
      soil: 'Solo rico, fértil e bem drenado. pH levemente ácido (5.5 a 6.5).',
      climate: 'Clima temperado. Temperatura entre 15°C e 25°C. Toleram frio moderado.',
      extraTips: 'Remova os estames ao abrir para evitar manchas de pólen. Corte a haste em diagonal.',
    },
    symbolism: 'Símbolo de pureza, inocência e renovação. Brancos: pureza e virgindade. Laranjas: paixão e confiança. Amarelos: gratidão. Rosa: prosperidade e abundância.',
    seasons: ['Primavera', 'Verão'],
    lifespan: '7 a 14 dias em vaso',
    difficulty: 'Fácil',
  },

  margaridas: {
    id: 7,
    slug: 'margaridas',
    name: 'Margarida',
    namePlural: 'Margaridas',
    heroImage: margaridasImg,
    gallery: [margaridasImg],
    priceRange: { min: 39.90, max: 129.90 },
    description: {
      origin: 'Originárias da Europa e Ásia, as margaridas (Bellis perennis) são uma das flores mais antigas conhecidas. Cerâmicas egípcias de 4.000 anos já traziam imagens de margaridas.',
      characteristics: 'Flores compostas da família Asteraceae com pétalas brancas radiando de um centro amarelo dourado. Podem ter 1 a 5cm de diâmetro dependendo da espécie.',
      curiosities: 'O nome "daisy" em inglês vem de "day\'s eye" (olho do dia), pois abre ao amanhecer e fecha ao anoitecer. Uma única margarida é formada por duas flores diferentes: as pétalas e o disco central.',
    },
    care: {
      water: 'Regar regularmente, mantendo o solo levemente úmido. Em vaso, trocar a água a cada 2 dias.',
      light: 'Sol pleno a meia-sombra. Pelo menos 4-6 horas de luz direta.',
      soil: 'Solo fértil e bem drenado. Toleram diversos tipos de solo.',
      climate: 'Clima temperado a subtropical. Temperatura ideal entre 15°C e 25°C. Resistentes ao frio leve.',
      extraTips: 'Arranque flores murchas para estimular novas florações. Divida touceiras a cada 2-3 anos.',
    },
    symbolism: 'Representam inocência, pureza, novos começos e amor leal. Na era vitoriana, significavam "eu nunca vou contar" (guardar segredo). Muito associadas à infância e simplicidade.',
    seasons: ['Primavera', 'Verão'],
    lifespan: '5 a 10 dias em vaso',
    difficulty: 'Fácil',
  },

  'flores-do-campo': {
    id: 8,
    slug: 'flores-do-campo',
    name: 'Flores do Campo',
    namePlural: 'Flores do Campo',
    heroImage: floresDoCampoImg,
    gallery: [floresDoCampoImg],
    priceRange: { min: 49.90, max: 189.90 },
    description: {
      origin: 'As flores do campo englobam uma variedade de espécies silvestres e semi-selvagens encontradas em prados, campos e bordas de florestas ao redor do mundo. Incluem gerberas, cravos, mosquitinhos, delfínios e muitas outras.',
      characteristics: 'Caracterizadas pela diversidade de cores, texturas e alturas. Os buquês de flores do campo misturam espécies diferentes criando arranjos naturais, orgânicos e cheios de movimento.',
      curiosities: 'Os buquês de flores do campo ganharam popularidade nos casamentos modernos por sua estética natural e despretensiosa. Muitas espécies são importantes para a polinização de abelhas e borboletas.',
    },
    care: {
      water: 'Trocar a água do vaso diariamente. Cortar as hastes em diagonal a cada 2-3 dias.',
      light: 'Manter em local iluminado, mas sem sol direto intenso.',
      soil: 'Para cultivo: solo leve, bem drenado e rico em matéria orgânica.',
      climate: 'Variam conforme a espécie. A maioria prefere clima temperado entre 15°C e 28°C.',
      extraTips: 'Adicione uma colher de açúcar e gotas de vinagre na água para prolongar a vida do buquê.',
    },
    symbolism: 'Representam liberdade, espontaneidade e alegria de viver. Buquês de flores do campo simbolizam amor natural, sem artifícios. São associadas à simplicidade e beleza genuína.',
    seasons: ['Primavera', 'Verão', 'Outono'],
    lifespan: '5 a 8 dias em vaso',
    difficulty: 'Fácil',
  },

  astromelias: {
    id: 9,
    slug: 'astromelias',
    name: 'Astromélia',
    namePlural: 'Astromélias',
    heroImage: astromeliasImg,
    gallery: [astromeliasImg],
    priceRange: { min: 59.90, max: 159.90 },
    description: {
      origin: 'Originárias da América do Sul, especialmente Chile e Brasil, as astromélias (Alstroemeria) foram nomeadas pelo botânico sueco Lineu em homenagem ao seu amigo, o barão Claus von Alströmer.',
      characteristics: 'Plantas perenes com flores em forma de trompete que lembram pequenos lírios. Cada haste produz múltiplas flores. Disponíveis em tons de rosa, salmão, amarelo, laranja, vermelho e branco.',
      curiosities: 'As folhas da astromélia são "invertidas" — crescem torcidas 180°, ficando com a parte inferior voltada para cima. Uma única haste pode durar até 2 semanas no vaso.',
    },
    care: {
      water: 'Regar 2-3 vezes por semana. Manter solo úmido. Em vaso, trocar água a cada 2 dias.',
      light: 'Meia-sombra a sol pleno. Proteger do sol intenso do meio-dia.',
      soil: 'Solo fértil, levemente ácido e bem drenado.',
      climate: 'Clima temperado a subtropical. Temperatura ideal entre 15°C e 25°C.',
      extraTips: 'Remova as folhas que ficam abaixo da linha d\'água no vaso. Flores murchas devem ser retiradas para estimular novas.',
    },
    symbolism: 'Representam amizade duradoura, devoção e prosperidade. Cada pétala tem um significado: compreensão, humor, paciência, empatia, compromisso e respeito.',
    seasons: ['Primavera', 'Verão'],
    lifespan: '10 a 14 dias em vaso',
    difficulty: 'Fácil',
  },

  lisianthus: {
    id: 10,
    slug: 'lisianthus',
    name: 'Lisianthus',
    namePlural: 'Lisianthus',
    heroImage: lisianthusImg,
    gallery: [lisianthusImg],
    priceRange: { min: 79.90, max: 199.90 },
    description: {
      origin: 'Originário do sul dos Estados Unidos, México e norte da América do Sul. O Eustoma grandiflorum foi descoberto em pradarias e áreas úmidas, e se tornou popular mundialmente a partir dos anos 1980.',
      characteristics: 'Flores duplas que lembram rosas ou peônias quando abertas, com pétalas delicadas e sedosas. Disponíveis em tons de branco, lilás, roxo, rosa, creme e bicolores.',
      curiosities: 'O lisianthus é uma das flores mais caras do mercado devido ao seu longo tempo de cultivo (5-6 meses). É a segunda flor de corte mais popular no Japão, atrás apenas do crisântemo.',
    },
    care: {
      water: 'Manter a água limpa, trocando a cada 2 dias. Evitar molhar as pétalas.',
      light: 'Luz indireta brilhante. Evitar sol direto que pode desbotar as pétalas.',
      soil: 'Solo leve, bem drenado e rico em nutrientes. pH entre 6.5 e 7.0.',
      climate: 'Clima temperado a quente. Temperatura ideal entre 18°C e 25°C.',
      extraTips: 'Corte hastes em diagonal com faca afiada (não tesoura). Botões fechados continuam abrindo no vaso.',
    },
    symbolism: 'Representam carisma, apreciação e gratidão profunda. Muito usados em casamentos, simbolizam união e compromisso. Lilás: encantamento. Branco: espiritualidade.',
    seasons: ['Primavera', 'Verão'],
    lifespan: '10 a 21 dias em vaso',
    difficulty: 'Avançado',
  },

  crisantemos: {
    id: 11,
    slug: 'crisantemos',
    name: 'Crisântemo',
    namePlural: 'Crisântemos',
    heroImage: crisantemosImg,
    gallery: [crisantemosImg],
    priceRange: { min: 39.90, max: 149.90 },
    description: {
      origin: 'Cultivados na China há mais de 3.000 anos, os crisântemos (Chrysanthemum) foram levados ao Japão no século VIII, onde se tornaram o símbolo imperial. A "Ordem do Crisântemo" é a mais alta honra japonesa.',
      characteristics: 'Flores compostas com grande variedade de formas: pompom, aranha, anêmona, decorativo e incurvado. Disponíveis em quase todas as cores: amarelo, branco, roxo, rosa, laranja e verde.',
      curiosities: 'No Japão, o "Festival do Crisântemo" (Kiku Matsuri) acontece todo outono. Chá de crisântemo é uma bebida tradicional na China com propriedades medicinais. É a flor mais produzida no mundo.',
    },
    care: {
      water: 'Regar regularmente, mantendo o solo úmido. Em vaso, trocar água a cada 2-3 dias.',
      light: 'Sol pleno a meia-sombra. Floração é influenciada pelo fotoperíodo (dias curtos).',
      soil: 'Solo rico, bem drenado e com boa drenagem. pH entre 6.0 e 7.0.',
      climate: 'Clima temperado. Temperatura ideal entre 13°C e 21°C. Resistem a geadas leves.',
      extraTips: 'Pode as pontas para estimular ramificação e mais flores. Remova botões laterais para flores maiores.',
    },
    symbolism: 'No Ocidente: homenagem aos falecidos (Finados). No Oriente: longevidade, alegria e perfeição. Amarelo: otimismo. Branco: lealdade e honestidade. Vermelho: amor e paixão.',
    seasons: ['Outono', 'Inverno'],
    lifespan: '14 a 21 dias em vaso',
    difficulty: 'Fácil',
  },
};

export const getFlowerBySlug = (slug) => flowerData[slug] || null;
export const getFlowerByCategoryId = (categoryId) => {
  return Object.values(flowerData).find(f => f.id === categoryId) || null;
};
export const getAllFlowers = () => Object.values(flowerData);

export default flowerData;
