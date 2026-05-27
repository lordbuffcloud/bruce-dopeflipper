from PIL import Image, ImageDraw, ImageFont

size = 128
img = Image.new("RGBA", (size, size), (5, 10, 10, 255))
draw = ImageDraw.Draw(img)

for i in range(6):
    c = (119, 252, 224, 40 + i * 25)
    draw.rounded_rectangle([i, i, size - 1 - i, size - 1 - i], radius=18, outline=c, width=1)

draw.rounded_rectangle([14, 14, size - 15, size - 15], radius=12, fill=(10, 18, 16, 255), outline=(47, 74, 67, 255))

accent = (119, 252, 224, 255)
white = (220, 255, 246, 255)
for y, row in enumerate(
    [
        "  ####  ",
        " #    # ",
        " #      ",
        "  ####  ",
        "      # ",
        " #    # ",
        "  ####  ",
    ]
):
    for x, ch in enumerate(row):
        if ch == "#":
            px = 34 + x * 7
            py = 28 + y * 7
            draw.rectangle([px, py, px + 5, py + 5], fill=accent)

for i, w in enumerate([52, 68, 40]):
    y = 88 + i * 10
    draw.rounded_rectangle([34, y, 34 + w, y + 6], radius=3, fill=(27, 201, 230, 200 if i != 1 else 255))

try:
    font = ImageFont.truetype("consola.ttf", 22)
except OSError:
    font = ImageFont.load_default()

draw.text((78, 34), "DF", fill=white, font=font)
img.save("logo.png")
print("wrote logo.png", img.size)
