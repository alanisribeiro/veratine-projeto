const localProducts = [
  // === Girassois (category 1) ===
  { id: 'local-gir-1', name: 'Buquê de Girassóis em Kraft', description: 'Buquê de girassóis com folhagens verdes em papel kraft artesanal', price: 99.90, image: '/images/products/girassol1.jpg', category: 1, rating: 4.8 },
  { id: 'local-gir-2', name: 'Girassóis com Mosquitinho', description: 'Buquê de girassóis com mosquitinho em papel branco elegante', price: 109.90, image: '/images/products/girassol2.jpg', category: 1, rating: 4.7 },
  { id: 'local-gir-3', name: 'Girassóis e Margaridas', description: 'Buquê misto de girassóis com margaridas e eucalipto, laço branco', price: 119.90, image: '/images/products/girassol3.jpg', category: 1, rating: 4.9 },
  { id: 'local-gir-4', name: 'Mini Girassóis em Kraft', description: 'Buquê de mini girassóis e rudbéckia em papel kraft', price: 79.90, image: '/images/products/girassol4.jpg', category: 1, rating: 4.6 },
  { id: 'local-gir-5', name: 'Girassóis Grande Luxo', description: 'Buquê grande de girassóis em papel verde oliva com laço dourado', price: 149.90, image: '/images/products/girassol5.jpg', category: 1, rating: 4.9 },
  { id: 'local-gir-6', name: 'Girassóis em Vaso Verde', description: 'Arranjo de girassóis em vaso de vidro verde sobre balcão', price: 129.90, image: '/images/products/girassol6.jpg', category: 1, rating: 4.7 },
  { id: 'local-gir-7', name: 'Girassóis com Gramíneas', description: 'Buquê simples de girassóis com gramíneas decorativas e laço branco', price: 89.90, image: '/images/products/girassol7.jpg', category: 1, rating: 4.5 },
  { id: 'local-gir-8', name: 'Arranjo Grande de Girassóis', description: 'Arranjo grande de girassóis em vaso de vidro com laço branco', price: 159.90, image: '/images/products/girassol8.jpg', category: 1, rating: 4.8 },
  { id: 'local-gir-9', name: 'Girassóis e Margaridas no Vaso', description: 'Arranjo de girassóis com margaridas em vaso de vidro', price: 119.90, image: '/images/products/girassol9.jpg', category: 1, rating: 4.7 },
  { id: 'local-gir-10', name: 'Mini Girassol com Mosquitinho', description: 'Mini arranjo de girassol com mosquitinho em garrafa de vidro', price: 59.90, image: '/images/products/girassol10.jpg', category: 1, rating: 4.6 },

  // === Orquídeas (category 2) ===
  { id: 'local-orq-1', name: 'Orquídea Phalaenopsis Branca', description: 'Orquídea Phalaenopsis branca com centros amarelos, elegante e clássica', price: 129.90, image: '/images/products/orquidea1.jpg', category: 2, rating: 4.9 },
  { id: 'local-orq-2', name: 'Orquídea Rosa Cascata', description: 'Orquídeas Phalaenopsis rosa abundantes em vaso cerâmico claro', price: 159.90, image: '/images/products/orquidea2.jpg', category: 2, rating: 4.8 },
  { id: 'local-orq-3', name: 'Orquídea Amarela em Vidro', description: 'Orquídeas Phalaenopsis amarelas em vaso de vidro sobre pedestal', price: 149.90, image: '/images/products/orquidea3.jpg', category: 2, rating: 4.9 },
  { id: 'local-orq-4', name: 'Orquídea Branca Multi-Hastes', description: 'Orquídeas brancas com centros amarelos em múltiplas hastes altas', price: 139.90, image: '/images/products/orquidea4.jpg', category: 2, rating: 4.7 },
  { id: 'local-orq-5', name: 'Orquídea Cymbidium Burgundy', description: 'Orquídeas Cymbidium burgundy escuras com labelo creme e dourado', price: 179.90, image: '/images/products/orquidea5.jpg', category: 2, rating: 4.9 },
  { id: 'local-orq-6', name: 'Orquídea Azul em Vaso Branco', description: 'Orquídeas Phalaenopsis azuis em vaso cerâmico branco canelado', price: 169.90, image: '/images/products/orquidea6.jpg', category: 2, rating: 4.6 },
  { id: 'local-orq-7', name: 'Orquídea Amarela e Rosa', description: 'Orquídeas Phalaenopsis amarelas com centros magenta em vaso bege', price: 139.90, image: '/images/products/orquidea7.jpg', category: 2, rating: 4.7 },
  { id: 'local-orq-8', name: 'Orquídea Cymbidium Vermelha', description: 'Orquídeas Cymbidium vermelhas vibrantes em cascata densa', price: 189.90, image: '/images/products/orquidea8.jpg', category: 2, rating: 4.8 },
  { id: 'local-orq-9', name: 'Buquê de Orquídeas Rosa', description: 'Buquê estilo noiva de orquídeas Cymbidium rosa delicadas', price: 199.90, image: '/images/products/orquidea9.jpg', category: 2, rating: 4.9 },
  { id: 'local-orq-10', name: 'Buquê Misto de Orquídeas', description: 'Buquê de orquídeas em tons rosa, branco e lavanda em papel elegante', price: 169.90, image: '/images/products/orquidea10.jpg', category: 2, rating: 4.8 },

  // === Rosas (category 3) ===
  { id: 'local-ros-1', name: 'Buquê de Rosas Rosa', description: 'Buquê de rosas rosa com mosquitinho e folhagens em papel kraft', price: 109.90, image: '/images/products/rosas1.jpg', category: 3, rating: 4.8 },
  { id: 'local-ros-2', name: 'Rosas Rosa Elegantes', description: 'Grande buquê de rosas rosa claro em papel branco com fita delicada', price: 139.90, image: '/images/products/rosas2.jpg', category: 3, rating: 4.9 },
  { id: 'local-ros-3', name: 'Rosas Mistas com Spray', description: 'Buquê misto de rosas pêssego com mini rosas laranja em kraft', price: 149.90, image: '/images/products/rosas3.jpg', category: 3, rating: 4.7 },
  { id: 'local-ros-4', name: 'Rosas Laranjas Vintage', description: 'Buquê de rosas laranjas vibrantes em papel jornal vintage', price: 119.90, image: '/images/products/rosas4.jpg', category: 3, rating: 4.6 },
  { id: 'local-ros-5', name: 'Rosas Amarelas Garden', description: 'Buquê de rosas amarelas estilo peônia em juta natural', price: 129.90, image: '/images/products/rosas5.jpg', category: 3, rating: 4.8 },
  { id: 'local-ros-6', name: 'Rosas Amarelas com Margaridas', description: 'Buquê de rosas amarelas com margaridas brancas e folhagens', price: 99.90, image: '/images/products/rosas6.jpg', category: 3, rating: 4.5 },
  { id: 'local-ros-7', name: 'Rosas Bicolor The Botanist', description: 'Buquê de rosas bicolor rosa e creme em embalagem The Botanist', price: 159.90, image: '/images/products/rosas7.jpg', category: 3, rating: 4.9 },

  // === Suculentas/Cactos (category 4) ===
  { id: 'local-cac-1', name: 'Cacto Cereus Decorativo', description: 'Cacto colunar com espinhos marrons em vaso cerâmico verde menta', price: 59.90, image: '/images/products/cacto1.jpg', category: 4, rating: 4.5 },
  { id: 'local-cac-2', name: 'Cacto Colunar em Terracota', description: 'Cacto colunar alto com espinhos amarelos em vaso de terracota', price: 69.90, image: '/images/products/cacto2.jpg', category: 4, rating: 4.4 },
  { id: 'local-cac-3', name: 'Cacto Florido Rosa', description: 'Cacto redondo com flores rosa e brancas delicadas em vaso branco', price: 79.90, image: '/images/products/cacto3.jpg', category: 4, rating: 4.8 },
  { id: 'local-cac-4', name: 'Arranjo de Suculentas Coloridas', description: 'Arranjo de suculentas em laranja, roxo, verde e vermelho em terracota', price: 89.90, image: '/images/products/cacto4.jpg', category: 4, rating: 4.7 },
  { id: 'local-cac-5', name: 'Jardim de Suculentas e Cactos', description: 'Mini jardim com cactos e suculentas variados em vaso cerâmico', price: 99.90, image: '/images/products/cacto5.jpg', category: 4, rating: 4.6 },
  { id: 'local-cac-6', name: 'Suculentas Floridas', description: 'Arranjo de suculentas verdes e rosadas com flores laranja em vaso branco', price: 79.90, image: '/images/products/cacto6.jpg', category: 4, rating: 4.7 },
  { id: 'local-cac-7', name: 'Suculentas em Vaso de Vidro', description: 'Suculentas verdes e vermelhas em vaso de vidro facetado', price: 69.90, image: '/images/products/cacto7.jpg', category: 4, rating: 4.5 },
  { id: 'local-cac-8', name: 'Suculenta em Terrário', description: 'Suculenta verde em terrário de vidro redondo com terra escura', price: 54.90, image: '/images/products/cacto8.jpg', category: 4, rating: 4.6 },
  { id: 'local-cac-9', name: 'Terrário Geométrico', description: 'Terrário geométrico dourado com suculentas e pedrinhas brancas', price: 109.90, image: '/images/products/cacto9.jpg', category: 4, rating: 4.8 },
  { id: 'local-cac-10', name: 'Terrário Aberto com Suculentas', description: 'Vaso de vidro aberto com suculentas, musgo e pedrinhas decorativas', price: 89.90, image: '/images/products/cacto10.jpg', category: 4, rating: 4.7 },

  // === Tulipas (category 5) ===
  { id: 'local-tul-1', name: 'Tulipas Coloridas em Kraft', description: 'Buquê vibrante de tulipas coloridas em papel kraft marrom', price: 89.90, image: '/images/products/tulipas1.jpg', category: 5, rating: 4.7 },
  { id: 'local-tul-2', name: 'Tulipas Rosa e Laranja', description: 'Buquê rústico de tulipas rosa, roxas e laranja sobre juta', price: 79.90, image: '/images/products/tulipas2.jpg', category: 5, rating: 4.6 },
  { id: 'local-tul-3', name: 'Tulipas Magenta e Brancas', description: 'Buquê compacto de tulipas magenta e brancas em kraft estampado', price: 84.90, image: '/images/products/tulipas3.jpg', category: 5, rating: 4.5 },
  { id: 'local-tul-4', name: 'Tulipas Rosa Elegantes', description: 'Buquê elegante de tulipas rosa e brancas com waxflower e fita rosa', price: 109.90, image: '/images/products/tulipas4.jpg', category: 5, rating: 4.8 },
  { id: 'local-tul-5', name: 'Tulipas Pêssego com Eucalipto', description: 'Buquê minimalista de tulipas pêssego com eucalipto em papel creme', price: 94.90, image: '/images/products/tulipas5.jpg', category: 5, rating: 4.7 },
  { id: 'local-tul-6', name: 'Tulipas Azuis com Rosas', description: 'Buquê delicado de tulipas azuis com rosas brancas e hortênsias', price: 129.90, image: '/images/products/tulipas6.jpg', category: 5, rating: 4.9 },
  { id: 'local-tul-7', name: 'Tulipas Multicoloridas Premium', description: 'Grande buquê de tulipas multicoloridas com mais de 50 hastes', price: 179.90, image: '/images/products/tulipas7.jpg', category: 5, rating: 4.9 },

  // === Lírios (category 6) ===
  { id: 'local-lir-1', name: 'Lírios Vermelhos com Mosquitinho', description: 'Buquê de lírios vermelhos com mosquitinho em papel kraft', price: 99.90, image: '/images/products/lirios1.jpg', category: 6, rating: 4.7 },
  { id: 'local-lir-2', name: 'Lírios Rosa com Rosas', description: 'Buquê misto de lírios stargazer rosa com rosas e mosquitinho', price: 119.90, image: '/images/products/lirios2.jpg', category: 6, rating: 4.8 },
  { id: 'local-lir-3', name: 'Lírios Rosa em Papel', description: 'Buquê de lírios orientais rosa vibrantes em papel rosa com fita branca', price: 109.90, image: '/images/products/lirios3.jpg', category: 6, rating: 4.6 },
  { id: 'local-lir-4', name: 'Lírios Rosa e Rosas Mix', description: 'Buquê solto de lírios rosa, rosas e mosquitinho com folhagens', price: 129.90, image: '/images/products/lirios4.jpg', category: 6, rating: 4.7 },
  { id: 'local-lir-5', name: 'Lírios Magenta com Astromélias', description: 'Buquê de lírios magenta com astromélias rosa em papel kraft', price: 114.90, image: '/images/products/lirios5.jpg', category: 6, rating: 4.8 },
  { id: 'local-lir-6', name: 'Lírios Brancos no Vaso', description: 'Arranjo clássico de lírios brancos em vaso de vidro sobre mesa rústica', price: 139.90, image: '/images/products/lirios6.jpg', category: 6, rating: 4.9 },
  { id: 'local-lir-7', name: 'Lírios Amarelos Premium', description: 'Arranjo abundante de lírios amarelos com eucalipto em vaso de vidro', price: 149.90, image: '/images/products/lirios7.png', category: 6, rating: 4.8 },
  { id: 'local-lir-8', name: 'Lírios Brancos com Eucalipto', description: 'Buquê elegante de lírios brancos com eucalipto e fita de cetim branca', price: 134.90, image: '/images/products/lirios8.jpg', category: 6, rating: 4.9 },

  // === Margaridas (category 7) ===
  { id: 'local-mar-1', name: 'Margaridas com Flores Azuis', description: 'Buquê de margaridas brancas com flores azuis em papel kraft com fita rosa', price: 69.90, image: '/images/products/margaridas1.jpg', category: 7, rating: 4.6 },
  { id: 'local-mar-2', name: 'Margaridas e Camomilas', description: 'Buquê de margaridas grandes e camomilas em papel lavanda', price: 79.90, image: '/images/products/margaridas2.jpg', category: 7, rating: 4.7 },
  { id: 'local-mar-3', name: 'Margaridas Brancas Premium', description: 'Grande buquê redondo de margaridas brancas com centros dourados', price: 89.90, image: '/images/products/margaridas3.jpg', category: 7, rating: 4.8 },
  { id: 'local-mar-4', name: 'Margaridas Elegantes', description: 'Buquê elegante de margaridas com folhagens em papel branco e fita cetim', price: 84.90, image: '/images/products/margaridas4.jpg', category: 7, rating: 4.7 },
  { id: 'local-mar-5', name: 'Camomilas Delicadas', description: 'Buquê denso de camomilas em papel creme com fita de renda', price: 74.90, image: '/images/products/margaridas5.jpg', category: 7, rating: 4.8 },
  { id: 'local-mar-6', name: 'Margaridas com Perpétuas', description: 'Buquê de margaridas brancas com perpétuas vermelhas e fita vermelha', price: 79.90, image: '/images/products/margaridas6.jpg', category: 7, rating: 4.5 },
  { id: 'local-mar-7', name: 'Margaridas e Flores Roxas', description: 'Grande buquê de margaridas com flores roxas e folhagens verdes', price: 94.90, image: '/images/products/margaridas7.jpg', category: 7, rating: 4.7 },
  { id: 'local-mar-8', name: 'Margaridas no Vaso', description: 'Arranjo de margaridas brancas em vaso de vidro com laço creme', price: 64.90, image: '/images/products/margaridas8.jpg', category: 7, rating: 4.6 },

  // === Flores do Campo (category 8) ===
  { id: 'local-fdc-1', name: 'Buquê Silvestre Misto', description: 'Buquê silvestre com ranúnculos amarelos, margaridas, flores rosas e gramíneas', price: 109.90, image: '/images/products/floresdocampo1.jpg', category: 8, rating: 4.8 },
  { id: 'local-fdc-2', name: 'Flores do Campo Coloridas', description: 'Buquê colorido de flores do campo em vermelho, rosa, amarelo e laranja em kraft', price: 89.90, image: '/images/products/floresdocampo2.jpg', category: 8, rating: 4.7 },
  { id: 'local-fdc-3', name: 'Buquê Outonal Rústico', description: 'Buquê rústico com girassóis, gerberas, lavanda e flores silvestres em kraft', price: 129.90, image: '/images/products/floresdocampo3.jpg', category: 8, rating: 4.9 },
  { id: 'local-fdc-4', name: 'Calêndulas e Campainhas', description: 'Buquê de calêndulas laranjas, campainhas azuis e flores brancas em jornal vintage', price: 94.90, image: '/images/products/floresdocampo4.jpg', category: 8, rating: 4.6 },
  { id: 'local-fdc-5', name: 'Lavanda e Calêndulas', description: 'Buquê de lavanda roxa com calêndulas laranjas e margaridas em kraft', price: 84.90, image: '/images/products/floresdocampo5.jpg', category: 8, rating: 4.7 },
  { id: 'local-fdc-6', name: 'Gérberas e Delfínios', description: 'Buquê de gérberas amarelas com delfínios roxos sobre caixote rústico', price: 99.90, image: '/images/products/floresdocampo6.jpg', category: 8, rating: 4.5 },
  { id: 'local-fdc-7', name: 'Buquê Pastoral', description: 'Buquê delicado de margaridas, lavanda e tanaceto no parapeito da janela', price: 79.90, image: '/images/products/floresdocampo7.jpg', category: 8, rating: 4.8 },
  { id: 'local-fdc-8', name: 'Buquê Campestre Elegante', description: 'Buquê elegante de cosmos brancos, flores lilás e gramíneas com fita rosa', price: 119.90, image: '/images/products/floresdocampo8.jpg', category: 8, rating: 4.9 },

  // === Astromélias (category 9) ===
  { id: 'local-ast-1', name: 'Astromélias Brancas no Vaso', description: 'Arranjo de astromélias brancas com folhagens em vaso de vidro', price: 89.90, image: '/images/products/astromelia1.jpg', category: 9, rating: 4.7 },
  { id: 'local-ast-2', name: 'Buquê de Astromélias Rosa', description: 'Buquê de astromélias rosa suave segurado à mão', price: 79.90, image: '/images/products/astromelia2.jpg', category: 9, rating: 4.6 },
  { id: 'local-ast-3', name: 'Astromélias Rosa no Vaso', description: 'Arranjo abundante de astromélias rosa claro em vaso de vidro', price: 99.90, image: '/images/products/astromelia3.jpg', category: 9, rating: 4.8 },
  { id: 'local-ast-4', name: 'Astromélias Mistas Embaladas', description: 'Buquê de astromélias mistas em rosa, coral, lilás e amarelo em papel rosé', price: 109.90, image: '/images/products/astromelia4.jpg', category: 9, rating: 4.7 },
  { id: 'local-ast-5', name: 'Buquê Redondo de Astromélias', description: 'Buquê compacto de astromélias rosa e brancas ao ar livre', price: 94.90, image: '/images/products/astromelia5.jpg', category: 9, rating: 4.5 },
  { id: 'local-ast-6', name: 'Astromélias Rosa e Brancas', description: 'Arranjo de astromélias rosa e brancas em vaso de vidro', price: 89.90, image: '/images/products/astromelia6.jpg', category: 9, rating: 4.6 },
  { id: 'local-ast-7', name: 'Astromélias Blush Altas', description: 'Arranjo alto de astromélias blush em vaso de vidro em canto branco', price: 104.90, image: '/images/products/astromelia7.jpg', category: 9, rating: 4.7 },
  { id: 'local-ast-8', name: 'Astromélias Creme e Pêssego', description: 'Buquê de astromélias creme e pêssego em vaso canelado com fita rosa', price: 114.90, image: '/images/products/astromelia8.jpg', category: 9, rating: 4.8 },
  { id: 'local-ast-9', name: 'Astromélias Laranja e Vermelhas', description: 'Arranjo de astromélias laranja e vermelho queimado em vaso de vidro', price: 99.90, image: '/images/products/astromelia9.jpg', category: 9, rating: 4.7 },
  { id: 'local-ast-10', name: 'Buquê de Astromélias Coral', description: 'Buquê redondo de astromélias coral com folhagens em papel pastel', price: 94.90, image: '/images/products/astromelia10.jpg', category: 9, rating: 4.6 },

  // === Lisianthus (category 10) ===
  { id: 'local-lis-1', name: 'Lisianthus Rosa e Branco', description: 'Buquê de lisianthus rosa pálido e branco com pétalas onduladas', price: 109.90, image: '/images/products/lisiantos1.jpg', category: 10, rating: 4.8 },
  { id: 'local-lis-2', name: 'Lisianthus Rosa Denso', description: 'Buquê denso de lisianthus rosa com botões verdes', price: 119.90, image: '/images/products/lisiantos2.jpg', category: 10, rating: 4.7 },
  { id: 'local-lis-3', name: 'Lisianthus Lavanda', description: 'Arranjo de lisianthus lavanda com botões verdes delicados', price: 114.90, image: '/images/products/lisiantos3.jpg', category: 10, rating: 4.9 },
  { id: 'local-lis-4', name: 'Lisianthus Lilás em Kraft', description: 'Dois buquês de lisianthus lilás embalados em papel kraft', price: 99.90, image: '/images/products/lisiantos4.jpg', category: 10, rating: 4.6 },
  { id: 'local-lis-5', name: 'Lisianthus Roxo no Vaso', description: 'Lisianthus roxo profundo em vaso de vidro transparente', price: 129.90, image: '/images/products/lisiantos5.jpg', category: 10, rating: 4.8 },
  { id: 'local-lis-6', name: 'Lisianthus Lavanda Rústico', description: 'Buquê de lisianthus lavanda com botões verdes em fundo de madeira', price: 104.90, image: '/images/products/lisiantos6.jpg', category: 10, rating: 4.5 },
  { id: 'local-lis-7', name: 'Lisianthus Lavanda Grande', description: 'Grande arranjo de lisianthus lavanda claro em ambiente interno', price: 139.90, image: '/images/products/lisiantos7.jpg', category: 10, rating: 4.7 },
  { id: 'local-lis-8', name: 'Lisianthus Lavanda Close-up', description: 'Arranjo compacto de lisianthus lavanda com pétalas onduladas', price: 109.90, image: '/images/products/lisiantos8.jpg', category: 10, rating: 4.6 },
  { id: 'local-lis-9', name: 'Lisianthus Roxo Embalado', description: 'Buquê redondo e denso de lisianthus roxo em papel lilás', price: 124.90, image: '/images/products/lisiantos9.jpg', category: 10, rating: 4.8 },

  // === Crisântemos (category 11) ===
  { id: 'local-cri-1', name: 'Crisântemos Brancos Pompom', description: 'Buquê de crisântemos brancos tipo pompom, denso e arredondado', price: 74.90, image: '/images/products/crisantemos1.jpg', category: 11, rating: 4.6 },
  { id: 'local-cri-2', name: 'Crisântemos Brancos e Cravos', description: 'Buquê de crisântemos brancos com cravos rosa em papel kraft e fita', price: 84.90, image: '/images/products/crisantemos2.jpg', category: 11, rating: 4.7 },
  { id: 'local-cri-3', name: 'Crisântemos Rosa Pompom', description: 'Buquê de grandes crisântemos rosa pompom com waxflower rosa', price: 89.90, image: '/images/products/crisantemos3.jpg', category: 11, rating: 4.8 },
  { id: 'local-cri-4', name: 'Crisântemos com Mosquitinho Azul', description: 'Buquê de crisântemos brancos com mosquitinho azul em papel azul claro', price: 79.90, image: '/images/products/crisantemos4.jpg', category: 11, rating: 4.5 },
  { id: 'local-cri-5', name: 'Crisântemos Rosa Claro', description: 'Grande buquê de crisântemos rosa claro pompom junto à janela', price: 94.90, image: '/images/products/crisantemos5.jpg', category: 11, rating: 4.7 },
  { id: 'local-cri-6', name: 'Crisântemos Rosa no Vaso', description: 'Arranjo de crisântemos rosa em vaso de vidro com fita rosa', price: 84.90, image: '/images/products/crisantemos6.jpg', category: 11, rating: 4.6 },
  { id: 'local-cri-7', name: 'Crisântemos Lilás e Brancos', description: 'Buquê de crisântemos brancos e lilás com mosquitinho em papel rosa', price: 89.90, image: '/images/products/crisantemos7.jpg', category: 11, rating: 4.7 },
  { id: 'local-cri-8', name: 'Crisântemos Lilás Escuro', description: 'Buquê de crisântemos lilás com centros roxos em celofane', price: 79.90, image: '/images/products/crisantemos8.jpg', category: 11, rating: 4.5 },
  { id: 'local-cri-9', name: 'Crisântemos Rosa com Waxflower', description: 'Buquê de crisântemos rosa grandes com waxflower rosa', price: 89.90, image: '/images/products/crisantemos9.jpg', category: 11, rating: 4.8 },
  { id: 'local-cri-10', name: 'Crisântemos Lilás e Brancos Mix', description: 'Buquê redondo de crisântemos brancos e lilás em papel rosa', price: 84.90, image: '/images/products/crisantemos10.jpg', category: 11, rating: 4.6 },
];

export default localProducts;
