#!/usr/bin/env python3
from PIL import Image
import os

# Icon sizes for Android
ICON_SIZES = {
    'mipmap-mdpi': 48,
    'mipmap-hdpi': 72,
    'mipmap-xhdpi': 96,
    'mipmap-xxhdpi': 144,
    'mipmap-xxxhdpi': 192,
}

# Foreground sizes (larger for adaptive icons)
FOREGROUND_SIZES = {
    'mipmap-mdpi': 108,
    'mipmap-hdpi': 162,
    'mipmap-xhdpi': 216,
    'mipmap-xxhdpi': 324,
    'mipmap-xxxhdpi': 432,
}

def generate_icons():
    # Load the source logo
    source_image = Image.open('public/Images/logo.png')
    
    # Convert to RGBA if not already
    if source_image.mode != 'RGBA':
        source_image = source_image.convert('RGBA')
    
    # Generate icons for each density
    for density, size in ICON_SIZES.items():
        print(f"Generating {density} icons ({size}x{size})...")
        
        # Resize image
        icon = source_image.resize((size, size), Image.Resampling.LANCZOS)
        
        # Create round icon (same as regular for now)
        round_icon = icon.copy()
        
        # Save icons
        base_path = f'android/app/src/main/res/{density}'
        icon.save(f'{base_path}/ic_launcher.png', 'PNG')
        round_icon.save(f'{base_path}/ic_launcher_round.png', 'PNG')
        
        print(f"  ✓ Saved ic_launcher.png and ic_launcher_round.png")
    
    # Generate foreground images for adaptive icons
    for density, size in FOREGROUND_SIZES.items():
        print(f"Generating {density} foreground ({size}x{size})...")
        
        # Resize image for foreground
        foreground = source_image.resize((size, size), Image.Resampling.LANCZOS)
        
        # Save foreground
        base_path = f'android/app/src/main/res/{density}'
        foreground.save(f'{base_path}/ic_launcher_foreground.png', 'PNG')
        
        print(f"  ✓ Saved ic_launcher_foreground.png")
    
    print("\n✅ All icons generated successfully!")

if __name__ == '__main__':
    generate_icons()
