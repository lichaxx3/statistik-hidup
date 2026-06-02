#!/usr/bin/env python3
"""Generate PWA icons for Statistik Hidup"""
import struct, zlib, base64

def make_png(size, bg_color, text_char='📊'):
    """Create a simple PNG icon"""
    # Use PIL if available, otherwise create minimal PNG
    try:
        from PIL import Image, ImageDraw, ImageFont
        img = Image.new('RGBA', (size, size), (8, 12, 24, 255))
        draw = ImageDraw.Draw(img)
        # Blue gradient circle background
        for r in range(size//2, 0, -1):
            alpha = int(255 * (r / (size//2)))
            draw.ellipse([
                size//2-r, size//2-r,
                size//2+r, size//2+r
            ], fill=(30, 111, 255, min(alpha, 200)))
        # Chart emoji / text
        try:
            font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', size//3)
        except:
            font = ImageFont.load_default()
        draw.text((size//2, size//2), 'S', fill='white', font=font, anchor='mm')
        img.save(f'icons/icon-{size}.png', 'PNG')
        print(f'Created icons/icon-{size}.png with PIL')
    except ImportError:
        # Fallback: create minimal 1px blue PNG scaled
        create_minimal_png(size)

def create_minimal_png(size):
    """Create a minimal blue PNG icon"""
    import struct, zlib
    
    def write_chunk(chunk_type, data):
        chunk_len = struct.pack('>I', len(data))
        chunk_data = chunk_type + data
        crc = struct.pack('>I', zlib.crc32(chunk_data) & 0xFFFFFFFF)
        return chunk_len + chunk_data + crc
    
    # Create RGBA pixel data - solid dark blue with blue circle
    pixels = []
    cx, cy = size // 2, size // 2
    r = int(size * 0.45)
    
    for y in range(size):
        row = []
        for x in range(size):
            dist = ((x - cx)**2 + (y - cy)**2)**0.5
            if dist <= r:
                # Blue circle
                row.extend([30, 111, 255, 255])
            else:
                # Dark background
                row.extend([8, 12, 24, 255])
        pixels.append(bytes(row))
    
    # PNG header
    png_header = b'\x89PNG\r\n\x1a\n'
    
    # IHDR chunk
    ihdr_data = struct.pack('>II', size, size) + bytes([8, 2, 0, 0, 0])  # 8-bit RGB... wait, RGBA=6
    ihdr_data = struct.pack('>IIBBBBB', size, size, 8, 6, 0, 0, 0)
    ihdr = write_chunk(b'IHDR', ihdr_data)
    
    # IDAT chunk - compress pixel data
    raw = b''
    for row in pixels:
        raw += b'\x00' + row  # filter type 0 (None) per row
    compressed = zlib.compress(raw, 9)
    idat = write_chunk(b'IDAT', compressed)
    
    # IEND chunk
    iend = write_chunk(b'IEND', b'')
    
    with open(f'icons/icon-{size}.png', 'wb') as f:
        f.write(png_header + ihdr + idat + iend)
    
    print(f'Created icons/icon-{size}.png (minimal)')

import os
os.makedirs('icons', exist_ok=True)
create_minimal_png(192)
create_minimal_png(512)
print('Icons generated!')
