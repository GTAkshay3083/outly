import os
import math
from PIL import Image, ImageDraw, ImageFont

BASE_DIR = r"c:\Users\aksha\OneDrive\Documents\outly"
RES_DIR = os.path.join(BASE_DIR, "android", "app", "src", "main", "res")

# Outly Brand Colors
COLOR_BG = (8, 8, 10, 255)            # #08080A Obsidian Black
COLOR_BG_CARD = (18, 18, 20, 255)     # #121214
COLOR_FLAME_PRIMARY = (255, 94, 58)    # #FF5E3A Flame Orange
COLOR_FLAME_SECONDARY = (255, 174, 51) # #FFAE33 Ember Gold
COLOR_ACCENT_GREEN = (29, 185, 84)     # #1DB954 Electric Green
COLOR_WHITE = (245, 245, 247)          # #F5F5F7
COLOR_MUTED = (161, 161, 166)          # #A1A1A6

def draw_flame(draw, center_x, center_y, size, alpha=255):
    """
    Draws Outly's signature multi-layered geometric flame and beacon emblem.
    """
    # Outer Flame Silhouette (Orange -> Amber)
    flame_pts = [
        (center_x, center_y - size * 0.58),                # Top flame tip
        (center_x + size * 0.22, center_y - size * 0.28),  # Right upper curve
        (center_x + size * 0.38, center_y + size * 0.05),  # Right belly
        (center_x + size * 0.32, center_y + size * 0.38),  # Right lower
        (center_x + size * 0.12, center_y + size * 0.52),  # Bottom right
        (center_x - size * 0.12, center_y + size * 0.52),  # Bottom left
        (center_x - size * 0.32, center_y + size * 0.38),  # Left lower
        (center_x - size * 0.38, center_y + size * 0.05),  # Left belly
        (center_x - size * 0.22, center_y - size * 0.28),  # Left upper curve
    ]
    draw.polygon(flame_pts, fill=(COLOR_FLAME_PRIMARY[0], COLOR_FLAME_PRIMARY[1], COLOR_FLAME_PRIMARY[2], alpha))

    # Inner Flame Glow (Golden Amber)
    inner_size = size * 0.62
    inner_y_offset = center_y + size * 0.06
    inner_pts = [
        (center_x, inner_y_offset - inner_size * 0.55),
        (center_x + inner_size * 0.24, inner_y_offset - inner_size * 0.15),
        (center_x + inner_size * 0.28, inner_y_offset + inner_size * 0.25),
        (center_x, inner_y_offset + inner_size * 0.45),
        (center_x - inner_size * 0.28, inner_y_offset + inner_size * 0.25),
        (center_x - inner_size * 0.24, inner_y_offset - inner_size * 0.15),
    ]
    draw.polygon(inner_pts, fill=(COLOR_FLAME_SECONDARY[0], COLOR_FLAME_SECONDARY[1], COLOR_FLAME_SECONDARY[2], alpha))

    # Central Core Meetup Beacon (Emerald Spark)
    spark_radius = size * 0.09
    spark_center_y = center_y + size * 0.18
    draw.ellipse(
        [
            (center_x - spark_radius, spark_center_y - spark_radius),
            (center_x + spark_radius, spark_center_y + spark_radius)
        ],
        fill=(COLOR_ACCENT_GREEN[0], COLOR_ACCENT_GREEN[1], COLOR_ACCENT_GREEN[2], alpha)
    )

def create_full_icon(size, is_round=False):
    """Generate high-res launcher icon (Obsidian background + Flame emblem)."""
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Background
    if is_round:
        draw.ellipse([(0, 0), (size - 1, size - 1)], fill=COLOR_BG)
        # Subtle glow ring
        draw.ellipse([(2, 2), (size - 3, size - 3)], outline=(COLOR_FLAME_PRIMARY[0], COLOR_FLAME_PRIMARY[1], COLOR_FLAME_PRIMARY[2], 70), width=max(1, int(size * 0.02)))
    else:
        # Rounded rectangle
        corner_radius = int(size * 0.22)
        draw.rounded_rectangle([(0, 0), (size - 1, size - 1)], radius=corner_radius, fill=COLOR_BG)
        draw.rounded_rectangle([(2, 2), (size - 3, size - 3)], radius=corner_radius, outline=(COLOR_FLAME_PRIMARY[0], COLOR_FLAME_PRIMARY[1], COLOR_FLAME_PRIMARY[2], 70), width=max(1, int(size * 0.02)))

    # Draw Emblem in center
    flame_size = size * 0.65
    draw_flame(draw, size / 2, size / 2, flame_size)
    return img

def create_foreground_icon(size):
    """Generate adaptive launcher foreground (Transparent background, centered flame)."""
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # In Android adaptive icons, safe zone is inner 66% (72dp of 108dp)
    flame_size = size * 0.44
    draw_flame(draw, size / 2, size / 2, flame_size)
    return img

def create_splash_screen(width, height):
    """Generate sleek obsidian splash screen with logo & brand tagline."""
    img = Image.new("RGBA", (width, height), COLOR_BG)
    draw = ImageDraw.Draw(img)

    center_x = width / 2
    center_y = height / 2 - (height * 0.04)

    # Centered Flame Emblem
    icon_size = min(width, height) * 0.28
    draw_flame(draw, center_x, center_y, icon_size)

    # Subtitle / Accent bar under logo
    bar_width = int(icon_size * 0.35)
    bar_height = max(3, int(height * 0.004))
    bar_top = center_y + icon_size * 0.58
    draw.rounded_rectangle(
        [(center_x - bar_width, bar_top), (center_x + bar_width, bar_top + bar_height)],
        radius=2,
        fill=COLOR_FLAME_PRIMARY
    )

    return img

def main():
    print("Generating Outly High-Res Android Branding Assets...")

    # 1. Launcher Icons (Standard & Round)
    launcher_specs = {
        "mipmap-mdpi": 48,
        "mipmap-hdpi": 72,
        "mipmap-xhdpi": 96,
        "mipmap-xxhdpi": 144,
        "mipmap-xxxhdpi": 192,
    }

    for folder, size in launcher_specs.items():
        folder_path = os.path.join(RES_DIR, folder)
        os.makedirs(folder_path, exist_ok=True)

        # ic_launcher.png
        icon = create_full_icon(size, is_round=False)
        icon.save(os.path.join(folder_path, "ic_launcher.png"), "PNG")

        # ic_launcher_round.png
        icon_round = create_full_icon(size, is_round=True)
        icon_round.save(os.path.join(folder_path, "ic_launcher_round.png"), "PNG")
        print(f"  ✓ {folder}: ic_launcher.png & ic_launcher_round.png ({size}x{size})")

    # 2. Adaptive Foreground Icons (108dp specs)
    fg_specs = {
        "mipmap-mdpi": 108,
        "mipmap-hdpi": 162,
        "mipmap-xhdpi": 216,
        "mipmap-xxhdpi": 324,
        "mipmap-xxxhdpi": 432,
    }

    for folder, size in fg_specs.items():
        folder_path = os.path.join(RES_DIR, folder)
        os.makedirs(folder_path, exist_ok=True)
        fg_icon = create_foreground_icon(size)
        fg_icon.save(os.path.join(folder_path, "ic_launcher_foreground.png"), "PNG")
        print(f"  ✓ {folder}: ic_launcher_foreground.png ({size}x{size})")

    # 3. Google Play Store 512x512 Master Store Icon
    play_icon = create_full_icon(512, is_round=False)
    play_icon_path = os.path.join(BASE_DIR, "play_store_icon_512.png")
    play_icon.save(play_icon_path, "PNG")
    print(f"  ✓ Google Play Store 512x512 Master Icon saved at: {play_icon_path}")

    # 4. Splash Screens (Portrait & Landscape across all densities)
    splash_specs = {
        "drawable": (480, 800),
        "drawable-port-mdpi": (320, 480),
        "drawable-port-hdpi": (480, 800),
        "drawable-port-xhdpi": (720, 1280),
        "drawable-port-xxhdpi": (960, 1600),
        "drawable-port-xxxhdpi": (1280, 1920),
        "drawable-land-mdpi": (480, 320),
        "drawable-land-hdpi": (800, 480),
        "drawable-land-xhdpi": (1280, 720),
        "drawable-land-xxhdpi": (1600, 960),
        "drawable-land-xxxhdpi": (1920, 1280),
    }

    for folder, (w, h) in splash_specs.items():
        folder_path = os.path.join(RES_DIR, folder)
        os.makedirs(folder_path, exist_ok=True)
        splash_img = create_splash_screen(w, h)
        splash_img.save(os.path.join(folder_path, "splash.png"), "PNG")
        print(f"  ✓ {folder}: splash.png ({w}x{h})")

    # 5. Web Favicon (public/favicon.svg and public/favicon.png)
    public_dir = os.path.join(BASE_DIR, "public")
    os.makedirs(public_dir, exist_ok=True)
    web_icon = create_full_icon(128, is_round=True)
    web_icon.save(os.path.join(public_dir, "favicon.png"), "PNG")
    print("  ✓ public/favicon.png generated")

    print("\nAll Android icons and splash assets successfully generated!")

if __name__ == "__main__":
    main()
