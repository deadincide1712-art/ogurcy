// ================= Огуречные Шокеры — русский и английский =================
// Игра написана по-русски, а перевод работает поверх: словарь подменяет текст в меню, HUD и подсказках,
// а имена оружия, карт и скинов переводятся прямо в данных. Новый текст, который появляется по ходу боя,
// ловит наблюдатель за DOM — поэтому переключать язык можно в любой момент.

const DICT_EN = {
  // ---------- меню ----------
  'Огуречные': 'Cucumber', 'Шокеры': 'Shockers', 'Огуречные Шокеры': 'Cucumber Shockers',
  'Все против всех · грядка №7': 'Free-for-all · garden bed #7',
  'Имя огурца': 'Cucumber name', 'твой огурец': 'your cucumber',
  'Играть': 'Play', 'Онлайн': 'Online', 'Оружие': 'Guns', 'Ножи': 'Knives', 'Огурец': 'Cucumber',
  'Настройки': 'Settings', 'Управление': 'Controls',
  'Играть с ботами': 'Play with bots', 'В бой!': 'Fight!', 'Реванш': 'Rematch',
  'Играть с друзьями по коду': 'Play with friends by code',
  'Создай лобби, отправь другу код — и он зайдёт к тебе. Публичные серверы и свой сервер — во вкладке «Онлайн».':
    'Create a lobby, send a friend the code and they join you. Public servers and your own server are on the "Online" tab.',
  'Создать лобби': 'Create lobby', 'Войти': 'Join', 'или': 'or', 'КОД': 'CODE',
  'Режим': 'Mode', 'Карта': 'Map', 'Засольщики-боты': 'Pickler bots', 'Боты': 'Bots', 'Число ботов': 'Bot count', 'Без ботов': 'No bots',
  'Малосольные': 'Lightly salted', 'Хрустящие': 'Crunchy', 'Маринованные': 'Pickled',
  'Игре нужны клавиатура и мышь — откройте страницу на компьютере.': 'The game needs a keyboard and mouse — open this page on a computer.',
  // ---------- режимы и их описания ----------
  'Каждый сам за себя': 'Free-for-all', 'Командный бой': 'Team battle', 'Захват точки': 'Hold the jar',
  'Гонка вооружений': 'Gun game', 'Сбор семечек': 'Seed collector', 'Ножевой бой': 'Knife fight',
  'Все против всех. Первый, кто нарежет 20 огурцов, забирает грядку.': 'Free-for-all. First to slice 20 cucumbers takes the garden.',
  'Укроп против Чеснока, 4 на 4. Команда, первой набравшая 40 нарезок, побеждает.': 'Dill vs Garlic, 4v4. First team to 40 slices wins.',
  'Захвати банку в центре грядки и удерживай её. Каждая секунда владения — очко, до 100.': 'Capture the jar in the middle and hold it. Every second of control is a point, first to 100.',
  'Каждая нарезка — следующий ствол: пистолет → шинковка → дробовик → автомат → снайперка → огурцомёт → нож. Побеждает тот, кто первым нарежет ножом. Удар ножом отбрасывает жертву на ступень назад.':
    'Every slice moves you up a gun: pistol → SMG → shotgun → rifle → sniper → launcher → knife. First knife slice wins. A knife hit knocks the victim one step back.',
  'Нарезанный огурец роняет семечко. Подбери семечко врага — очко твоей команде. Подбери своё — очко врагу не засчитают. До 30 очков.':
    'A sliced cucumber drops a seed. Grab an enemy seed for a point, grab your own to deny theirs. First to 30.',
  'Только ножи! Бегаешь быстрее, удар в спину нарезает сразу. Первый, кто нарежет 15 огурцов, побеждает.': 'Knives only! You run faster and a backstab slices instantly. First to 15 wins.',
  // ---------- карты ----------
  'Грядка №7': 'Garden bed #7', 'Кухня': 'Kitchen', 'Теплица': 'Greenhouse', 'Засолочный цех': 'Pickling plant',
  'Огород стал больше: сеновал с помостом, парники, подсолнухи, тыквы, ульи и пугало.': 'A bigger garden: a hay barn with a platform, poly tunnels, sunflowers, pumpkins, beehives and a scarecrow.',
  'Огромный стол: кружка в центре, кастрюля, тёрка-башня и полка-антресоль под потолком — туда ведут стопки книг.':
    'A giant table: a mug in the middle, a cooking pot, a grater tower and a shelf near the ceiling — stacks of books lead up there.',
  'Стеклянная теплица: двухъярусные стеллажи, перегородка с проходами, кашпо и кукуруза по углам.': 'A glass greenhouse: two-tier racks, a partition with gaps, hanging pots and corn in the corners.',
  'Два этажа: внизу конвейеры и чаны, наверху галерея по периметру, мостики и стеклянная диспетчерская.': 'Two floors: conveyors and vats below, a perimeter catwalk, bridges and a glass control room above.',
  // ---------- оружие ----------
  'Рассол-47': 'Brine-47', 'Укроп-12': 'Dill-12', 'Кабачок-М': 'Zucchini-M', 'Шинковка-3000': 'Shredder-3000',
  'Огурцомёт': 'Cuke Launcher', 'Корнишон-9': 'Gherkin-9', 'Нож': 'Knife',
  'Основное оружие': 'Primary weapon',
  'В бою с собой только этот ствол и нож. Сменить его можно после смерти, пока ждёшь возрождения.': 'You carry this gun and a knife only. Swap it after you die, while you wait to respawn.',
  'Скины оружия': 'Gun skins', 'Скины ножей': 'Knife skins', 'Скин огурца': 'Cucumber skin',
  'Открываются за нарезки из конкретного ствола: 10 — огуречная кожура, 30 — томатный соус, 75 — золотой.':
    'Unlocked by slices with that gun: 10 — cucumber peel, 30 — tomato sauce, 75 — gold.',
  'Открываются за нарезки этим же ножом: 10 — чеснок, 30 — чили, 75 — золото.': 'Unlocked by slices with that knife: 10 — garlic, 30 — chili, 75 — gold.',
  'Открываются за общее число нарезок: 15 — маринованный, 40 — малосольный в банке, 100 — учёный, 200 — золотой.':
    'Unlocked by total slices: 15 — pickled, 40 — jarred, 100 — scientist, 200 — golden.',
  'универсальный': 'all-rounder', 'в упор': 'point blank', 'издалека': 'long range', 'скорострельный': 'rapid fire',
  'взрывные огурцы': 'explosive cukes', 'бесконечные патроны': 'infinite ammo',
  'Заводской': 'Factory', 'Огуречная кожура': 'Cucumber peel', 'Томатный соус': 'Tomato sauce', 'Золотой': 'Gold',
  // ---------- ножи ----------
  'Шинковщик': 'Chopper', 'Керамбит «Чили»': 'Chili Karambit', 'Бабочка «Горошек»': 'Pea Butterfly', 'Золотой нож': 'Golden Knife',
  'керамбита «Чили»': 'the Chili Karambit', 'бабочки «Горошек»': 'the Pea Butterfly', 'золотого ножа': 'the Golden Knife',
  'Чеснок': 'Garlic', 'Чили': 'Chili',
  // ---------- скины огурцов ----------
  'Огурчик': 'Cuke', 'Маринованный': 'Pickled', 'Малосольный в банке': 'Jarred cucumber', 'Огурчик-учёный': 'Cuke scientist', 'Золотой огурец': 'Golden cucumber',
  'Обычный боевой огурец с грядки': 'A regular battle cucumber from the garden',
  'Тёмная кожура, укроп на макушке и долька чеснока': 'Dark peel, dill on top and a garlic clove',
  'Воюет прямо из стеклянной банки с рассолом': 'Fights straight out of a glass jar of brine',
  'Синяя шевелюра, монобровь и лабораторный халат': 'Blue hair, a unibrow and a lab coat',
  'Золотая кожура и корона': 'Golden peel and a crown',
  '. Скин видят все игроки в матче.': '. Everyone in the match sees your skin.',
  // ---------- онлайн ----------
  'Сервер · выбери с самым маленьким пингом': 'Server · pick the lowest ping',
  'Европа': 'Europe', 'США': 'USA', 'Азия': 'Asia', 'Этот сервер': 'This server',
  'Франкфурт': 'Frankfurt', 'Вирджиния': 'Virginia', 'Сингапур': 'Singapore',
  'Выбран автоматически — самый быстрый. ': 'Picked automatically — the fastest one. ',
  'Друзья должны выбрать тот же сервер, иначе не увидят твоё лобби.': 'Friends must pick the same server or they will not see your lobby.',
  'Сервер можно сменить, когда выйдешь из матча.': 'You can switch servers once you leave the match.',
  'меряем пинг…': 'measuring ping…', 'просыпается…': 'waking up…', 'нет связи': 'no connection',
  'Публичные серверы · заходи и играй против всех': 'Public servers · jump in and fight everyone',
  'Огород для всех': 'Garden for everyone', 'Укроп против Чеснока': 'Dill vs Garlic', 'Битва за банку': 'Battle for the jar',
  'Загружаем список…': 'Loading the list…', 'Полный': 'Full', 'от игрока': 'player-made',
  'Создать свой публичный сервер': 'Create your own public server', 'Название сервера': 'Server name',
  'Первая карта': 'First map', 'Создать сервер': 'Create server',
  'Сервер появится в общем списке, зайти сможет любой. Когда все выйдут, он удалится.': 'The server shows up in the public list and anyone can join. It is deleted once everybody leaves.',
  'Игра с друзьями по коду — на вкладке «Играть».': 'Playing with friends by code is on the "Play" tab.',
  'Код лобби — отправь друзьям': 'Lobby code — send it to friends', 'Скопировать': 'Copy', 'Скопировано': 'Copied',
  'Игроки': 'Players', 'Начать матч': 'Start match', 'Выйти из лобби': 'Leave lobby',
  'Настройки меняет хост. В матч можно зайти и когда он уже идёт.': 'The host changes the settings. You can join a match already in progress.',
  'Ждём, пока хост начнёт матч…': 'Waiting for the host to start the match…',
  'За Укроп': 'Join Dill', 'За Чеснок': 'Join Garlic', 'Укроп': 'Dill', 'хост': 'host', 'ты': 'you',
  'Код лобби — 5 символов, например K7MQ2': 'A lobby code is 5 characters, for example K7MQ2',
  'Матч уже идёт — подключаемся…': 'The match is already running — joining…', 'Подключаемся…': 'Connecting…',
  'Создаём сервер…': 'Creating the server…', 'Не удалось подключиться к серверу': 'Could not connect to the server',
  'Соединение с сервером потеряно': 'Lost connection to the server', 'Хост закрыл лобби': 'The host closed the lobby',
  'Список серверов недоступен — игра открыта без сервера.': 'The server list is unavailable — the game is running without a server.',
  'Этот сервер сейчас недоступен — выбери другой.': 'This server is unavailable right now — pick another one.',
  'Открой игру через сервер (npm start), а не как файл': 'Open the game through the server (npm start), not as a file',
  'Хост вышел — теперь матч ведёшь ты': 'The host left — you are running the match now',
  // ---------- звук и графика ----------
  'Звук': 'Sound', 'Музыка': 'Music', 'Эффекты': 'Effects', 'Громкость': 'Volume',
  'Звук только в активном окне': 'Sound only in the active window',
  'Графика': 'Graphics', 'Авто': 'Auto', 'Высокая': 'High', 'Средняя': 'Medium', 'Низкая': 'Low',
  'высокая': 'high', 'средняя': 'medium', 'низкая': 'low',
  'Если экран дёргается или кадров мало — поставь «Низкая»: без теней и в меньшем разрешении игра идёт намного плавнее.':
    'If the screen stutters or the frame rate is low, switch to "Low": no shadows and a smaller resolution make the game much smoother.',
  'Язык': 'Language',
  // ---------- служебная панель ----------
  'Служебная панель': 'Admin panel', 'Пароль': 'Password', 'Пароль не подошёл.': 'Wrong password.',
  'Видеть сквозь стены': 'See through walls', 'Автоприцел': 'Auto aim', 'Неуязвимость': 'Invulnerable',
  'Обнулить цель': 'Zero out target', 'Дать свежесть': 'Give freshness', 'Сколько свежести выдавать': 'How much freshness to give',
  'Наведись на огурца и жми: соперника обнуляет, своему (или себе, если никто не в прицеле) ставит указанное здоровье. В онлайне чужое здоровье меняется только с правами от сервера.':
    'Aim at a cucumber and press: an enemy gets zeroed out, a teammate (or you, if nobody is targeted) gets the health you set. Online, changing other players’ health needs rights from the server.',
  'Права админа подтверждены сервером': 'Admin rights confirmed by the server',
  'Проверяем…': 'Checking…',
  'Кейсы': 'Cases', 'Кошелёк': 'Wallet', 'Огуречный кейс': 'Cucumber case', 'Открыть · 100 🪙': 'Open · 100 🪙',
  '5 скинов огурца и по 5 скинов на каждый ствол. Повтор возвращает часть монет.': '5 cucumber skins and 5 skins for every gun. A duplicate refunds some coins.',
  'Шансы по редкости': 'Odds by rarity', 'Задания на сегодня · обновляются каждый день': 'Today\u2019s quests · refreshed daily',
  'За каждую победу в матче — ещё 100 монет.': 'Every match win gives another 100 coins.', 'Инвентарь': 'Inventory',
  'Пока пусто — открой первый кейс.': 'Empty for now — open your first case.', 'Надеть': 'Equip', 'Надет': 'Equipped', 'Готово': 'Done',
  'Получено': 'Claimed', 'Скин огурца': 'Cucumber skin', 'скин огурца': 'cucumber skin', 'Новый предмет в инвентаре!': 'New item in your inventory!',
  'Выпадает из кейса': 'Drops from the case', 'Монеты — на кейсы': 'Coins — spend them on cases', 'Открытие кейса': 'Opening a case',
  'Обычный': 'Common', 'Необычный': 'Uncommon', 'Редкий': 'Rare', 'Эпический': 'Epic', 'Легендарный': 'Legendary',
  'Садовый камуфляж': 'Garden camo', 'Арбузный': 'Watermelon', 'Неоновый рассол': 'Neon brine', 'Лавовый чили': 'Lava chili', 'Радужный огурец': 'Rainbow cucumber',
  'Огурец в кепке': 'Cuke in a cap', 'Корнишон-пират': 'Pirate gherkin', 'Огурец-ниндзя': 'Ninja cuke', 'Космо-огурец': 'Cosmo cuke',
  'Красная кепка козырьком вперёд': 'A red cap with the peak forward', 'Бандана, повязка на глаз и золотая серьга': 'A bandana, an eyepatch and a gold earring',
  'Тёмная кожура, маска и повязка с хвостами': 'Dark peel, a mask and a headband with tails', 'Стеклянный шлем, скафандр и светящаяся антенна': 'A glass helmet, a spacesuit and a glowing antenna',
  'Переливается всеми цветами и носит нимб': 'Shimmers in every colour and wears a halo',
  'Нарежь 10 огурцов': 'Slice 10 cucumbers', 'Нарежь 25 огурцов': 'Slice 25 cucumbers', 'Сделай 3 нарезки в голову': 'Land 3 headshot slices',
  'Нарежь 2 огурца ножом': 'Slice 2 cucumbers with a knife', 'Доиграй 3 матча до конца': 'Finish 3 matches', 'Подбери 5 ящиков или банок': 'Pick up 5 crates or jars',
  'Выиграй матч': 'Win a match', 'Сделай серию из 3 нарезок': 'Get a 3-slice streak', 'Введи пароль.': 'Enter the password.',
  'Сервер недоступен — попробуй ещё раз.': 'Server unavailable — try again.',
  'На сервере не задан ADMIN_PASS — панель выключена': 'ADMIN_PASS is not set on the server — the panel is off', 'Наведись на соперника': 'Aim at an enemy',
  // ---------- HUD и бой ----------
  'свежесть': 'freshness', 'Банки': 'Jars', 'Пауза': 'Paused', 'Кликни, чтобы вернуться на грядку': 'Click to get back to the garden',
  'Кликни мимо этого окна, чтобы вернуться в бой': 'Click outside this box to get back to the fight',
  'Выйти в меню': 'Quit to menu', 'Esc — пауза · Tab — счёт': 'Esc — pause · Tab — scores',
  'Выбери оружие на следующую жизнь': 'Pick a gun for your next life',
  'Выбери оружие на следующую жизнь — клик или клавиши 1–6': 'Pick a gun for your next life — click or keys 1–6',
  'Enter или пробел — тоже «Играть»': 'Enter or Space also means "Play"',
  'Нарезал': 'Slices', 'Нарезан': 'Sliced', 'нарезано': 'sliced', 'лидер': 'leader', 'ступень': 'tier',
  'нарезал': 'sliced', 'закатал сам себя': 'canned themselves', ' · в голову': ' · headshot',
  'ты на точке': 'you are on the jar', 'Банка ничья': 'The jar is neutral', 'Банка снова ничья': 'The jar is neutral again',
  'Банка закатана!': 'Jar sealed!', 'Банку делят!': 'The jar is contested!',
  'Со спины!': 'Backstab!', 'В макушку!': 'Right in the crown!', 'Двойная нарезка!': 'Double slice!',
  'Засолка': 'Pickling', 'Засолка…': 'Pickling…', 'Оливье!': 'Olivier salad!', 'Рассольник': 'Pickle soup!',
  'Самонарезка': 'Self-slice', 'Огуречный бог!': 'Cucumber god!', 'банка +1': 'jar +1',
  'Тебя нарезали!': 'You got sliced!', 'Грядка твоя!': 'The garden is yours!', 'Победа!': 'Victory!', 'Поражение': 'Defeat',
  'Семечко засчитано! +1': 'Seed counted! +1', 'Семечко перехвачено — очко врагу не достанется': 'Seed denied — the enemy gets nothing',
  'Патроны кончились — ищи жёлтый ящик или смени оружие': 'Out of ammo — find a yellow crate or switch weapons',
  'Новый нож открыт!': 'New knife unlocked!', 'Новый скин открыт!': 'New skin unlocked!',
  'Новый скин ножа!': 'New knife skin!', 'Новый огурец открыт!': 'New cucumber unlocked!',
  'вкл': 'on', 'выкл': 'off', 'свой · ': 'ally · ',
  // ---------- управление ----------
  'бегать по грядке': 'run around the garden', 'целиться, ЛКМ — стрелять': 'aim, LMB — shoot',
  'прицелиться по мушке — точнее бьёт (у Кабачка-М — оптика)': 'aim down the sights — much more accurate (the Zucchini-M has a scope)',
  'прыжок (на ящики тоже)': 'jump (onto crates too)',
  'основное оружие · нож (колесо мыши — переключить)': 'primary weapon · knife (mouse wheel switches)',
  'после смерти: выбрать ствол на следующую жизнь': 'while dead: pick a gun for the next life',
  'ножом — сильный удар, в спину — сразу нарезка': 'with a knife — heavy hit, backstab slices instantly',
  'осмотреть оружие · у каждого ножа две анимации, выпадают случайно': 'inspect the weapon · each knife has two animations, picked at random',
  'перезарядка': 'reload', 'кинуть банку с рассолом': 'throw a brine jar', 'Подбор': 'Pickups',
  'патроны и банки кончаются — подбирай ящики и рюкзачки с нарезанных огурцов': 'ammo and jars run out — grab crates and backpacks dropped by sliced cucumbers',
  'идти медленно и точнее': 'walk slowly and shoot straighter', 'пауза, громкость и выход в меню': 'pause, volume and quit to menu',
  'Выстрел в голову — двойной урон. В командных режимах свои подсвечены голубым и видны сквозь стены, враги обведены красным, а прицел меняет цвет, когда наведён на огурца.':
    'Headshots do double damage. In team modes allies glow blue and show through walls, enemies are outlined red, and the crosshair changes colour when you aim at a cucumber.',
  'Мышь': 'Mouse', 'Пробел': 'Space', 'ПКМ': 'RMB', '1 · 2': '1 · 2', '1–6': '1–6',
};

let LANG = 'ru';
try { const l = localStorage.getItem('ogurcy-lang'); if (l === 'ru' || l === 'en') LANG = l; else LANG = /^ru\b/i.test(navigator.language || '') ? 'ru' : 'en'; } catch (e) {}

// строки, которые собираются из кусочков: переводим по образцу
const PATTERNS = [
  [/^(.+) сделал из тебя салат$/, (m) => `${m[1]} made a salad out of you`],
  [/^Победил (.+)$/, (m) => `Winner: ${m[1]}`],
  [/^Ты нарезал (\d+) огурцов$/, (m) => `You sliced ${m[1]} cucumbers`],
  [/^Ты нарезал (\d+) · жми «Реванш» для новой попытки$/, (m) => `You sliced ${m[1]} · hit "Rematch" to try again`],
  [/^(.+) забирает грядку · счёт (\d+) : (\d+)$/, (m) => `${m[1]} takes the garden · score ${m[2]} : ${m[3]}`],
  [/^(.+) захватил банку!$/, (m) => `${m[1]} captured the jar!`],
  [/^(.+) отбивает банку · (\d+)%$/, (m) => `${m[1]} is taking the jar back · ${m[2]}%`],
  [/^Захват: (.+) (\d+)%$/, (m) => `Capturing: ${m[1]} ${m[2]}%`],
  [/^Банку держит (.+)$/, (m) => `The jar is held by ${m[1]}`],
  [/^Ты за команду (.+?)( · захвати банку!)?$/, (m) => `You are on ${m[1]}${m[2] ? ' · capture the jar!' : ''}`],
  [/^Ступень (\d+)\/(\d+): (.+)$/, (m) => `Tier ${m[1]}/${m[2]}: ${m[3]}`],
  [/^В этом режиме оружие выдаётся само: (.+)$/, (m) => `This mode hands out the weapon: ${m[1]}`],
  [/^Играть через (\d+)$/, (m) => `Play in ${m[1]}`],
  [/^нарезок до победы: (\d+)$/, (m) => `slices to win: ${m[1]}`],
  [/^семечек до победы: (\d+)$/, (m) => `seeds to win: ${m[1]}`],
  [/^\/ (\d+)$/, (m) => `/ ${m[1]}`],
  [/^Нарезано всего: (\d+)\. Все ножи открыты!$/, (m) => `Total slices: ${m[1]}. Every knife is unlocked!`],
  [/^Нарезано всего: (\d+)\. До (.+) ещё (\d+)\. Нарезка ножом засчитывается за две\.$/, (m) => `Total slices: ${m[1]}. ${m[3]} more to ${m[2]}. A knife slice counts double.`],
  [/^нарезано: (\d+)$/, (m) => `sliced: ${m[1]}`],
  [/^🔒 (.+) · (\d+)$/, (m) => `🔒 ${m[1]} · ${m[2]}`],
  [/^За (\d+) нарезок · уже в руках, жми 7 · другой нож выбирается в меню$/, (m) => `For ${m[1]} slices · already in your hands, press 7 · pick another knife in the menu`],
  [/^За (\d+) нарезок этим ножом · уже надет · сменить можно в разделе «Ножи»$/, (m) => `For ${m[1]} slices with this knife · already equipped · change it on the "Knives" tab`],
  [/^За (\d+) нарезок · уже надет · сменить можно в разделе «Огурец»$/, (m) => `For ${m[1]} slices · already equipped · change it on the "Cucumber" tab`],
  [/^За (\d+) нарезок из этого ствола · уже надет · сменить можно в меню «Скины оружия»$/, (m) => `For ${m[1]} slices with this gun · already equipped · change it under "Gun skins"`],
  [/^Откроется, когда нарежешь (\d+) огурцов$/, (m) => `Unlocks once you slice ${m[1]} cucumbers`],
  [/^Сейчас: (.+)\. Если игра начнёт тормозить, качество понизится само\.$/, (m) => `Now: ${T(m[1])}. If the game starts to lag, quality drops on its own.`],
  [/^(.+)\. Скин видят все игроки в матче\.$/, (m) => `${T(m[1])}. Everyone in the match sees your skin.`],
  [/^Выбран автоматически — самый быстрый\. (.+)$/, (m) => `Picked automatically — the fastest one. ${T(m[1])}`],
  [/^Сервер (.+)$/, (m) => `${m[1]}'s server`],
  [/^(.+) присоединился$/, (m) => `${m[1]} joined`],
  [/^(.+) вышел из игры$/, (m) => `${m[1]} left the game`],
  [/^Подключаемся к «(.+)»…$/, (m) => `Connecting to "${m[1]}"…`],
  [/^(.+): (\d+) свежести$/, (m) => `${m[1]}: ${m[2]} freshness`],
  [/^Себе (\d+) свежести$/, (m) => `${m[1]} freshness for yourself`],
  [/^(.+) — в салат$/, (m) => `${m[1]} — into the salad`],
  [/^Банки: (\d+) · \[G\]$/, (m) => `Jars: ${m[1]} · [G]`],
  [/^(\d+) мс$/, (m) => `${m[1]} ms`],
  [/^\+(\d+) монет · (.+)$/, (m) => `+${m[1]} coins · ${m[2] === 'за победу' ? 'for the win' : T(m[2])}`],
  [/^Задание выполнено: (.+) — забери награду в разделе «Кейсы»$/, (m) => `Quest complete: ${T(m[1])} — claim it on the "Cases" tab`],
  [/^Уже есть — вернули (\d+) монет$/, (m) => `Already owned — ${m[1]} coins refunded`],
  [/^Не хватает монет: нужно (\d+), у тебя (\d+)\.$/, (m) => `Not enough coins: you need ${m[1]}, you have ${m[2]}.`],
  [/^(.+) · (скин огурца)$/, (m) => `${T(m[1])} · cucumber skin`],
  [/^🎁 (.+)$/, (m) => `🎁 ${T(m[1])}`],
  [/^(Садовый камуфляж|Арбузный|Неоновый рассол|Лавовый чили|Радужный огурец) · (.+)$/, (m) => `${T(m[1])} · ${T(m[2])}`],
  [/^(\d+) \/ (\d+)$/, (m) => `${m[1]} / ${m[2]}`],
  [/^АДМИН · стены (вкл|выкл) \[V\] · аим (вкл|выкл) \[B\] · неуязвимость (вкл|выкл) \[N\] · K — обнулить · H — вылечить$/,
    (m) => `ADMIN · walls ${m[1] === 'вкл' ? 'on' : 'off'} [V] · aim ${m[2] === 'вкл' ? 'on' : 'off'} [B] · godmode ${m[3] === 'вкл' ? 'on' : 'off'} [N] · K — zero out · H — heal`],
  [/^(.+) · (в голову|headshot)$/, (m) => `${m[1]} · headshot`],
  [/^Лобби с таким кодом не найдено$/, () => 'No lobby with that code'],
  [/^Лобби заполнено: уже (\d+) игроков$/, (m) => `Lobby is full: already ${m[1]} players`],
  [/^Серверов уже слишком много — зайди в один из списка$/, () => 'Too many servers already — join one from the list'],
  [/^Пароль админа не подошёл$/, () => 'Wrong admin password'],
  [/^ · следующий матч через (\d+) с$/, (m) => ` · next match in ${m[1]} s`],
];

function T(s) {
  if (LANG !== 'en' || !s) return s;
  const key = s.trim();
  if (DICT_EN[key] !== undefined) return s.replace(key, DICT_EN[key]);
  for (const [re, fn] of PATTERNS) { const m = key.match(re); if (m) return s.replace(key, fn(m)); }
  return s;
}

// ---------- подмена текста на странице ----------
const ORIG = new WeakMap();
const LAST = new WeakMap();   // что мы сами вписали в узел: чужие правки отличаем от своих
let sweeping = false;
const ATTRS = ['placeholder', 'title', 'aria-label'];
// имена игроков, коды и названия чужих серверов не трогаем — это не наш текст
const SKIP_SEL = '#charName, #nick, #lobbyCode, #feed .k, #feed .v, #boardBody td:first-child, #lobbyPanel li span, #charHostLobby';
const skipped = el => el && el.closest && el.closest(SKIP_SEL);
function sweepNode(node) {
  if (node.nodeType === 3 && skipped(node.parentElement)) return;
  if (node.nodeType === 1 && skipped(node)) return;
  if (node.nodeType === 3) {
    const raw = ORIG.get(node) !== undefined ? ORIG.get(node) : node.nodeValue;
    if (!/\S/.test(raw)) return;
    ORIG.set(node, raw);
    const out = LANG === 'en' ? T(raw) : raw;
    if (node.nodeValue !== out) node.nodeValue = out;
    LAST.set(node, out);
    return;
  }
  if (node.nodeType !== 1) return;
  if (node.tagName === 'SCRIPT' || node.tagName === 'STYLE' || node.tagName === 'CANVAS') return;
  for (const a of ATTRS) {
    if (!node.hasAttribute(a)) continue;
    const store = ORIG.get(node) || {};
    const raw = store[a] !== undefined ? store[a] : node.getAttribute(a);
    store[a] = raw; ORIG.set(node, store);
    const out = LANG === 'en' ? T(raw) : raw;
    if (node.getAttribute(a) !== out) node.setAttribute(a, out);
  }
  for (let c = node.firstChild; c; c = c.nextSibling) sweepNode(c);
}
function sweep(root) {
  if (sweeping) return;
  sweeping = true;
  try { sweepNode(root || document.body); } finally { sweeping = false; }
}

// ---------- перевод данных: названия оружия, карт, режимов, скинов ----------
function trField(o, key) {
  if (!o || o[key] === undefined) return;
  if (o['__' + key] === undefined) o['__' + key] = o[key];
  o[key] = LANG === 'en' ? T(o['__' + key]) : o['__' + key];
}
function trData() {
  const each = (obj, keys) => { if (!obj) return; for (const k of Object.keys(obj)) for (const f of keys) trField(obj[k], f); };
  if (typeof WEAPONS === 'object') each(WEAPONS, ['name']);
  if (typeof MODES === 'object') each(MODES, ['name', 'hint']);
  if (typeof MAPS === 'object') each(MAPS, ['name', 'hint']);
  if (typeof TEAMS === 'object') each(TEAMS, ['name']);
  if (typeof KNIFE_SKINS === 'object') each(KNIFE_SKINS, ['name', 'gen']);
  if (typeof KNIFE_FINS === 'object') each(KNIFE_FINS, ['name']);
  if (typeof GUN_SKINS === 'object') each(GUN_SKINS, ['name']);
  if (typeof CHAR_SKINS === 'object') each(CHAR_SKINS, ['name', 'hint']);
  if (typeof GFX_LEVELS === 'object') each(GFX_LEVELS, ['name']);
  if (typeof REGIONS === 'object') for (const r of REGIONS) { trField(r, 'name'); trField(r, 'city'); }
}
// перерисовать всё, что собрано из данных
function relayoutLang() {
  const call = f => { try { if (typeof window[f] === 'function') window[f](); } catch (e) {} };
  ['renderKnifePick', 'renderKnifeFins', 'renderGunSkins', 'renderPrimaryPick', 'renderLoadout', 'renderCharPick', 'renderRegions', 'renderLobby', 'adminHud', 'syncVolumeUI'].forEach(call);
  const mh = document.getElementById('modeHint'), mp = document.getElementById('mapHint');
  if (mh && typeof MODES === 'object' && typeof menuMode === 'string' && MODES[menuMode]) mh.textContent = MODES[menuMode].hint;
  if (mp && typeof MAPS === 'object' && typeof menuMap === 'string' && MAPS[menuMap]) mp.textContent = MAPS[menuMap].hint;
  if (typeof updateRespawnUI === 'function' && typeof running !== 'undefined' && running) try { updateRespawnUI(); } catch (e) {}
}
function setLang(id) {
  if (id !== 'ru' && id !== 'en') return;
  LANG = id;
  try { localStorage.setItem('ogurcy-lang', id); } catch (e) {}
  document.documentElement.lang = id;
  trData(); relayoutLang(); sweep(document.body);
  document.querySelectorAll('#langPick button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === id)));
}

addEventListener('DOMContentLoaded', () => {
  const box = document.getElementById('langPick');
  if (box) box.addEventListener('click', e => { const b = e.target.closest('button'); if (b) setLang(b.dataset.lang); });
  // новый текст в меню и HUD переводим сразу, как он появился
  new MutationObserver(muts => {
    if (LANG !== 'en' || sweeping) return;
    sweeping = true;
    try {
      for (const m of muts) {
        if (m.type === 'characterData') {
          if (LAST.get(m.target) === m.target.nodeValue) continue;   // это наша же подмена
          ORIG.delete(m.target); sweepNode(m.target);
        }
        else m.addedNodes.forEach(n => sweepNode(n));
      }
    } finally { sweeping = false; }
  }).observe(document.body, { childList: true, subtree: true, characterData: true });
  setLang(LANG);
});
