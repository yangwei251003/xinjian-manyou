"""Build the local font subsets and collect their redistribution notices."""
from pathlib import Path
import hashlib
import json
import shutil
from fontTools import subset
from fontTools.ttLib import TTFont

root = Path(__file__).resolve().parents[1]
library = Path.home() / 'Documents/VideoCreation/Resources/Fonts'
assets = root / 'assets'
text = ''.join(path.read_text(encoding='utf-8') for path in [
    root / 'film-plan.mjs', root / 'drawing.mjs', *sorted((root / 'shots').glob('*.mjs')),
]) + ''.join(map(chr, range(32, 127))) + '心理学测试…×→−·√'
characters = set(map(ord, text))

fonts = [
    ('sans', 'NotoSansSC', 'NotoSansSC.ttf', 'https://github.com/notofonts/noto-cjk'),
    ('serif', 'NotoSerifSC', 'NotoSerifSC.ttf', 'https://github.com/notofonts/noto-cjk'),
    ('play', 'zcoolkuaile', 'ZCOOLKuaiLe-Regular.ttf', 'https://fonts.google.com/specimen/ZCOOL+KuaiLe'),
]
records = []
for alias, folder, filename, source in fonts:
    font = TTFont(library / folder / filename, recalcTimestamp=False)
    if alias == 'sans':
        missing = [chr(cp) for cp in characters if cp >= 32 and cp not in font.getBestCmap() and chr(cp).isprintable()]
        if missing:
            print('Primary font fallback glyphs:', ''.join(sorted(missing)))
    options = subset.Options()
    options.flavor = 'woff2'
    selected = subset.Subsetter(options=options)
    selected.populate(unicodes=characters)
    selected.subset(font)
    font.flavor = 'woff2'
    output = assets / f'{alias}.woff2'
    font.save(output)
    shutil.copyfile(library / folder / 'LICENSE.txt', assets / f'{alias}-OFL.txt')
    records.append({'file':output.name,'source':source,'license':'SIL OFL 1.1','sha256':hashlib.sha256(output.read_bytes()).hexdigest()})
    print(output.name, output.stat().st_size)
(assets / 'fonts.json').write_text(json.dumps(records, indent=2) + '\n', encoding='utf-8')
