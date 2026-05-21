from PIL import Image
import os

SRC = r"C:\Users\acer\.gemini\antigravity-ide\brain\a01c54c1-d1ef-4bab-84d7-5726d5a4fa1a\windsore_user_icon_1779383484977.png"
BASE = r"C:\Users\acer\Desktop\windsore-app\android\app\src\main\res"

SIZES = {
    "mipmap-mdpi":    48,
    "mipmap-hdpi":    72,
    "mipmap-xhdpi":   96,
    "mipmap-xxhdpi":  144,
    "mipmap-xxxhdpi": 192,
}

img = Image.open(SRC).convert("RGBA")
print(f"Source: {img.size}")

for folder, size in SIZES.items():
    resized = img.resize((size, size), Image.LANCZOS)
    out_dir = os.path.join(BASE, folder)
    for name in ["ic_launcher.png", "ic_launcher_round.png", "ic_launcher_foreground.png"]:
        out_path = os.path.join(out_dir, name)
        resized.save(out_path, "PNG")
        print(f"  Saved {size}x{size} -> {out_path}")

print("All icons resized successfully!")
