from PIL import Image, ImageDraw, ImageFont
import os

public_dir = '/Users/doss/.gemini/antigravity/scratch/methodology/public'

def create_icon(size, filename):
    # Background image with rounded rectangle
    img = Image.new('RGBA', (size, size), (15, 23, 42, 255))
    draw = ImageDraw.Draw(img)
    
    # Draw gradient-like rounded box
    padding = int(size * 0.08)
    corner = int(size * 0.2)
    draw.rounded_rectangle(
        [(padding, padding), (size - padding, size - padding)],
        radius=corner,
        fill=(37, 99, 235, 255),
        outline=(59, 130, 246, 255),
        width=int(size * 0.02)
    )
    
    # Draw character "方" or stylised geometric shape
    # Draw central cross and beams
    cx = size // 2
    cy = size // 2
    w = int(size * 0.45)
    bar_h = max(2, int(size * 0.06))
    
    # Top dot
    draw.ellipse([(cx - bar_h, cy - int(w*0.75)), (cx + bar_h, cy - int(w*0.5))], fill=(255, 255, 255, 255))
    # Horizontal beam
    draw.rounded_rectangle([(cx - w//2, cy - int(w*0.4)), (cx + w//2, cy - int(w*0.4) + bar_h)], radius=bar_h//2, fill=(255, 255, 255, 255))
    # Center vertical hook
    draw.rounded_rectangle([(cx - bar_h//2, cy - int(w*0.3)), (cx + bar_h//2, cy + int(w*0.5))], radius=bar_h//2, fill=(255, 255, 255, 255))
    # Left stroke
    draw.line([(cx - bar_h, cy - int(w*0.1)), (cx - int(w*0.4), cy + int(w*0.45))], fill=(255, 255, 255, 255), width=bar_h)
    # Right stroke
    draw.line([(cx + bar_h, cy - int(w*0.1)), (cx + int(w*0.45), cy + int(w*0.5))], fill=(255, 255, 255, 255), width=bar_h)
    
    out_path = os.path.join(public_dir, filename)
    img.save(out_path, 'PNG')
    print(f"Created {out_path} ({size}x{size})")

create_icon(192, 'icon-192.png')
create_icon(512, 'icon-512.png')
create_icon(180, 'apple-touch-icon.png')
