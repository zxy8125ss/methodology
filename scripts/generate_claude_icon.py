import math
from PIL import Image, ImageDraw

def render_claude_style_icon(export_size=512):
    # Render at 4x resolution (2048x2048) for pristine supersampled anti-aliasing
    canvas_size = 2048
    img = Image.new('RGB', (canvas_size, canvas_size), (250, 249, 245)) # Warm Ivory #FAF9F5
    draw = ImageDraw.Draw(img)
    
    cx, cy = canvas_size / 2, canvas_size / 2
    
    # Claude Terracotta colors
    terracotta = (204, 120, 92)      # #CC785C Anthropic signature
    terracotta_deep = (184, 104, 77) # #B8684D
    amber_spark = (224, 122, 95)     # #E07A5F
    
    # 8-ray Cognition Compass Star (Claude-inspired intellectual asterisk/starburst)
    # The symbol occupies ~56% of canvas, leaving a generous 22% safe margin around
    r_outer = canvas_size * 0.28
    r_inner = canvas_size * 0.10
    
    # Draw 8 smooth teardrop/petal rays radiating from center
    # 4 cardinal rays (slightly longer) and 4 diagonal rays
    num_rays = 8
    for i in range(num_rays):
        angle = (2 * math.pi / num_rays) * i - (math.pi / 2)
        is_cardinal = (i % 2 == 0)
        curr_r = r_outer if is_cardinal else r_outer * 0.82
        width = canvas_size * (0.052 if is_cardinal else 0.042)
        
        # Ray tip
        tx = cx + curr_r * math.cos(angle)
        ty = cy + curr_r * math.sin(angle)
        
        # Perpendicular normal
        nx = -math.sin(angle) * width
        ny = math.cos(angle) * width
        
        # Draw smooth organic petal using polygon with rounded cap
        p1 = (cx + nx * 0.6, cy + ny * 0.6)
        p2 = (tx + nx * 0.2, ty + ny * 0.2)
        p3 = (tx, ty)
        p4 = (tx - nx * 0.2, ty - ny * 0.2)
        p5 = (cx - nx * 0.6, cy - ny * 0.6)
        
        draw.polygon([p1, p2, p3, p4, p5], fill=terracotta)
        # End cap circle for smooth tip
        draw.ellipse([(tx - width*0.3, ty - width*0.3), (tx + width*0.3, ty + width*0.3)], fill=terracotta)

    # Central cohesive disc
    center_r = canvas_size * 0.12
    draw.ellipse([(cx - center_r, cy - center_r), (cx + center_r, cy + center_r)], fill=terracotta)
    
    # Inner glowing aperture (Ivory)
    aperture_r = canvas_size * 0.055
    draw.ellipse([(cx - aperture_r, cy - aperture_r), (cx + aperture_r, cy + aperture_r)], fill=(250, 249, 245))
    
    # Core amber cognition spark
    core_r = canvas_size * 0.026
    draw.ellipse([(cx - core_r, cy - core_r), (cx + core_r, cy + core_r)], fill=amber_spark)

    # Downsample with high-fidelity Lanczos resampling
    final_img = img.resize((export_size, export_size), Image.Resampling.LANCZOS)
    return final_img

# Generate all required icon assets
public_path = '/Users/doss/.gemini/antigravity/scratch/methodology/public'

icon_512 = render_claude_style_icon(512)
icon_512.save(f'{public_path}/icon-512.png', 'PNG', optimize=True)

icon_192 = render_claude_style_icon(192)
icon_192.save(f'{public_path}/icon-192.png', 'PNG', optimize=True)

apple_icon = render_claude_style_icon(180)
apple_icon.save(f'{public_path}/apple-touch-icon.png', 'PNG', optimize=True)

print("Successfully generated Claude-aesthetic icons at 512, 192, 180px!")
