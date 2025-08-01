from PIL import Image, ImageDraw
import os

def create_favicon():
    # Create a 32x32 image with transparency
    size = 32
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Draw background circle
    draw.ellipse([0, 0, size-1, size-1], fill=(26, 26, 26, 255))
    
    # Draw play button triangle (white)
    triangle_points = [(12, 8), (12, 24), (24, 16)]
    draw.polygon(triangle_points, fill=(255, 255, 255, 255))
    
    # Draw film strip decoration (gray squares)
    squares = [
        (4, 6), (4, 10), (4, 20), (4, 24),  # Left side
        (26, 6), (26, 10), (26, 20), (26, 24)  # Right side
    ]
    
    for x, y in squares:
        draw.rectangle([x, y, x+1, y+1], fill=(136, 136, 136, 255))
    
    # Save as ICO file with multiple sizes
    sizes = [(16, 16), (32, 32), (48, 48)]
    images = []
    
    for target_size in sizes:
        resized_img = img.resize(target_size, Image.Resampling.LANCZOS)
        images.append(resized_img)
    
    # Save the main image as the first one
    images[1].save('favicon.ico', format='ICO', sizes=[(16, 16), (32, 32), (48, 48)])
    print("Favicon created successfully!")

if __name__ == "__main__":
    create_favicon()
