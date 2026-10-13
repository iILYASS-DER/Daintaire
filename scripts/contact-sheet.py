import os, glob
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
RAW = os.path.join(HERE, "raw")

def sheet(names, out, cols=3, cell=(340, 230)):
    rows = (len(names) + cols - 1) // cols
    W, H = cols * cell[0], rows * (cell[1] + 22)
    canvas = Image.new("RGB", (W, H), "white")
    d = ImageDraw.Draw(canvas)
    for i, n in enumerate(names):
        p = os.path.join(RAW, f"{n}-small.jpg")
        if not os.path.exists(p):
            continue
        im = Image.open(p).convert("RGB")
        im.thumbnail(cell)
        x = (i % cols) * cell[0]
        y = (i // cols) * (cell[1] + 22)
        canvas.paste(im, (x + (cell[0]-im.width)//2, y + (cell[1]-im.height)//2))
        d.text((x + 6, y + cell[1] + 4), n, fill="black")
    canvas.save(out, quality=80)
    print(out, canvas.size)

names = sorted({os.path.basename(p).replace("-small.jpg", "") for p in glob.glob(os.path.join(RAW, "*-small.jpg"))})
sheet(names[:12], os.path.join(HERE, "sheet1.jpg"))
sheet(names[12:], os.path.join(HERE, "sheet2.jpg"))
