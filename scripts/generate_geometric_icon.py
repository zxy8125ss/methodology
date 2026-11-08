from PIL import Image, ImageDraw
import math
import os

public_dir = '/Users/doss/.gemini/antigravity/scratch/methodology/public'

def generate_geometric_icon(size, filename):
    # Ultra-clean Notion/Craft dark paper aesthetic
    img = Image.new('RGBA', (size, size), (9, 9, 11, 255)) # Zinc-950
    draw = ImageDraw.Draw(img)
    
    # Outer squircle container with refined inner border
    pad = int(size * 0.06)
    radius = int(size * 0.24)
    
    # Subtle elevated base card
    draw.rounded_rectangle(
        [(pad, pad), (size - pad, size - pad)],
        radius=radius,
        fill=(24, 24, 27, 255), # Zinc-900
        outline=(63, 63, 70, 200), # Zinc-700
        width=max(1, int(size * 0.015))
    )
    
    # Draw geometric infinity / mobius prism in the center
    cx, cy = size // 2, size // 2
    scale = size * 0.28
    
    # Draw intersecting isometric hexagonal diamond planes (Craft / Minimalist Math style)
    # 6 outer vertices of a regular hexagon
    points = []
    for i in range(6):
        angle = math.pi / 3 * i - math.pi / 6
        x = cx + scale * math.cos(angle)
        y = cy + scale * math.sin(angle)
        points.append((x, y))
    
    # Top diamond (pure bright white / silver)
    draw.polygon([points[5], points[0], (cx, cy), points[4]], fill=(250, 250, 250, 250))
    # Right diamond (cool zinc grey)
    draw.polygon([points[0], points[1], points[2], (cx, cy)], fill=(161, 161, 170, 230))
    # Left diamond (deep charcoal)
    draw.polygon([points[2], points[3], points[4], (cx, cy)], fill=(113, 113, 122, 220))
    
    # Central isometric slit / aperture (gives depth)
    inner_scale = scale * 0.42
    in_pts = []
    for i in range(6):
        angle = math.pi / 3 * i - math.pi / 6
        x = cx + inner_scale * math.cos(angle)
        y = cy + inner_scale * math.sin(angle)
        in_pts.append((x, y))
        
    draw.polygon(in_pts, fill=(24, 24, 27, 255), outline=(255, 255, 255, 180), width=max(1, int(size * 0.015)))

    out_path = os.path.join(public_dir, filename)
    img.save(out_path, 'PNG')
    print(f"Generated {out_path} ({size}x{size})")

generate_geometric_icon(512, 'icon-512.png')
generate_geometric_icon(192, 'icon-192.png')
generate_geometric_icon(180, 'apple-touch-icon.png')
