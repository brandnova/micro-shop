#!/usr/bin/env python
"""
One-time script to import products and images from the Stock Pics folder.
Run with: python import_products.py

The Stock Pics folder should be placed in the "gitignore" folder outside the project root.
"""

import os
import sys
import django
from pathlib import Path
from django.core.files import File

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from core.models import Product, ProductImage

# ============================================
# PRODUCT DATA DEFINITION
# ============================================

PRODUCTS_DATA = [
    # Beauty & Grooming (3)
    {
        "folder": "Beard Kit",
        "name": "Premium Men's Beard Grooming Kit",
        "category": "Beauty & Grooming",
        "price": 12500,
        "quantity": 45,
        "description": "Complete 7-piece beard care kit with premium boar bristle brush, stainless steel scissors, premium beard oil, balm, comb, and storage pouch. Softens beard, reduces itch, and promotes healthy growth. Perfect for all beard types and lengths."
    },
    {
        "folder": "Face Cream",
        "name": "Hydrating Anti-Aging Face Cream",
        "category": "Beauty & Grooming",
        "price": 18000,
        "quantity": 80,
        "description": "Rich, non-greasy moisturizer formulated with hyaluronic acid, vitamin C, and collagen peptides. Reduces fine lines and wrinkles, improves skin elasticity, and provides 24-hour deep hydration. Suitable for all skin types including sensitive skin."
    },
    {
        "folder": "Lotion",
        "name": "Shea Butter Intensive Body Lotion",
        "category": "Beauty & Grooming",
        "price": 7500,
        "quantity": 150,
        "description": "Deeply moisturizing body lotion made with natural shea butter, coconut oil, and vitamin E. Absorbs quickly without greasy residue, repairs dry skin, and provides 48-hour hydration. Perfect for daily use on all skin types."
    },
    
    # Fashion & Accessories (8)
    {
        "folder": "Hoodie",
        "name": "Premium Cotton Oversized Hoodie",
        "category": "Fashion & Accessories",
        "price": 22500,
        "quantity": 70,
        "description": "Ultra-soft cotton-blend oversized hoodie featuring a cozy fleece interior, large kangaroo pocket, adjustable drawstring hood, and ribbed cuffs. Relaxed fit perfect for casual wear, lounging, or layering. Available in multiple colors."
    },
    {
        "folder": "Jeans",
        "name": "Slim Fit Stretch Denim Jeans",
        "category": "Fashion & Accessories",
        "price": 19500,
        "quantity": 90,
        "description": "Classic slim-fit jeans crafted from premium denim with comfort stretch technology. Features five-pocket design, reinforced stitching, zip fly with button closure, and durable fabric that maintains shape. Perfect for daily wear."
    },
    {
        "folder": "Shirt",
        "name": "Classic Fit 100% Cotton T-Shirt",
        "category": "Fashion & Accessories",
        "price": 9500,
        "quantity": 200,
        "description": "Essential crewneck t-shirt made from 100% combed ring-spun cotton for ultimate softness. Features classic fit, reinforced collar and shoulder seams, tear-away label, and durable print that won't fade. Breathable fabric perfect for everyday wear."
    },
    {
        "folder": "Wallet",
        "name": "Genuine Leather Bifold Wallet",
        "category": "Fashion & Accessories",
        "price": 14000,
        "quantity": 85,
        "description": "Premium genuine leather bifold wallet with 8 card slots, 2 bill compartments, and ID window. Features RFID blocking technology to protect your cards. Slim design, hand-stitched edges, and includes gift box. Ages beautifully with use."
    },
    {
        "folder": "Wrist strap",
        "name": "Adjustable Paracord Wrist Strap",
        "category": "Fashion & Accessories",
        "price": 3200,
        "quantity": 180,
        "description": "Durable military-grade paracord wrist strap with quick-release buckle and metal clip. Perfect for keys, ID badges, USB drives, or camera. Adjustable fit, weather-resistant, and tested to hold heavy loads."
    },
    {
        "folder": "Bottle",
        "name": "Premium Stainless Steel Water Bottle",
        "category": "Fashion & Accessories",
        "price": 8500,
        "quantity": 120,
        "description": "Double-wall vacuum insulated stainless steel bottle keeps drinks cold for 24 hours or hot for 12 hours. BPA-free, leak-proof lid, powder-coated finish, and eco-friendly reusable design. Fits most cup holders."
    },
    {
        "folder": "Mug",
        "name": "Ceramic Coffee Mug 350ml",
        "category": "Fashion & Accessories",
        "price": 4500,
        "quantity": 130,
        "description": "Premium ceramic mug with ergonomic C-handle for comfortable grip. Holds 350ml (12oz) of your favorite beverage. Microwave and dishwasher safe, glossy finish, and durable construction that resists chipping."
    },
    {
        "folder": "Bag",
        "name": "Laptop Backpack",
        "category": "Fashion & Accessories",
        "price": 25000,
        "quantity": 40,
        "description": "Water-resistant laptop backpack with padded compartment for 15.6-inch laptop. Features multiple pockets for organization, USB charging port, anti-theft design, and breathable mesh back panel. Perfect for work, travel, or school."
    },
    
    # Electronics (7)
    {
        "folder": "Buds",
        "name": "True Wireless Noise Cancelling Earbuds",
        "category": "Electronics",
        "price": 45000,
        "quantity": 60,
        "description": "Advanced Bluetooth 5.3 earbuds with active noise cancellation (ANC) and transparency mode. Features 30-hour total battery life, touch controls, IPX5 water resistance, and crystal clear call quality. Includes charging case and 3 ear tip sizes."
    },
    {
        "folder": "Bulb",
        "name": "Smart WiFi LED Bulb (RGB)",
        "category": "Electronics",
        "price": 3500,
        "quantity": 200,
        "description": "Energy-saving 9W RGB smart bulb (equivalent to 60W) with 16 million colors and tunable white (2700K-6500K). Works with Alexa, Google Home, and SmartThings. Schedule settings, voice control, and no hub required. 2-year warranty."
    },
    {
        "folder": "Headphones",
        "name": "Over-Ear Wireless Headphones",
        "category": "Electronics",
        "price": 65000,
        "quantity": 35,
        "description": "Studio-quality over-ear headphones with hybrid active noise cancellation. Features 40-hour battery life, memory foam ear cushions, foldable design for travel, and 40mm dynamic drivers for rich, balanced sound. Includes carrying case and audio cable."
    },
    {
        "folder": "Keyboard",
        "name": "Mechanical RGB Gaming Keyboard",
        "category": "Electronics",
        "price": 35000,
        "quantity": 40,
        "description": "Mechanical gaming keyboard with tactile blue switches and customizable per-key RGB lighting. Features anti-ghosting, N-key rollover, durable double-shot keycaps, magnetic wrist rest, and multimedia controls. Perfect for gaming and typing."
    },
    {
        "folder": "Powerbank",
        "name": "20000mAh Fast Charging Power Bank",
        "category": "Electronics",
        "price": 28000,
        "quantity": 50,
        "description": "High-capacity portable charger with 20000mAh capacity. Features dual USB ports, USB-C input/output, and built-in cables. Digital display shows remaining power, supports fast charging up to 22.5W, and charges phones 5+ times."
    },
    {
        "folder": "Watch",
        "name": "Smart Fitness Tracker Watch",
        "category": "Electronics",
        "price": 32000,
        "quantity": 55,
        "description": "Advanced fitness tracker with 1.3-inch AMOLED display. Features continuous heart rate monitoring, SpO2 tracking, sleep analysis, and 25+ sports modes. 7-day battery life, 5ATM water-resistant, and customizable watch faces."
    },
    {
        "folder": "Speaker",
        "name": "Portable Bluetooth Speaker",
        "category": "Electronics",
        "price": 18500,
        "quantity": 75,
        "description": "Waterproof portable Bluetooth speaker with 360° surround sound. Features 15-hour playtime, built-in microphone for calls, and rugged design. Pair two speakers for stereo sound. Perfect for outdoor adventures or home use."
    },
    
    # Home & Kitchen (3)
    {
        "folder": "Laptop Stand",
        "name": "Adjustable Aluminum Laptop Stand",
        "category": "Home & Kitchen",
        "price": 15000,
        "quantity": 55,
        "description": "Ergonomic aluminum laptop stand with 6 adjustable height settings and foldable design for portability. Features silicone grips to prevent slipping, improves posture by raising screen to eye level, and enhances airflow for better cooling."
    },
    {
        "folder": "Tripod",
        "name": "Professional Camera & Phone Tripod",
        "category": "Home & Kitchen",
        "price": 11000,
        "quantity": 65,
        "description": "Universal 50-inch tripod with flexible legs and universal phone holder. Features Bluetooth remote shutter, 360° ball head, and lightweight aluminum construction. Compatible with all smartphones, action cameras, and DSLRs. Perfect for vlogging."
    },
    {
        "folder": "Lamp",
        "name": "LED Desk Lamp with Wireless Charger",
        "category": "Home & Kitchen",
        "price": 16500,
        "quantity": 45,
        "description": "Modern LED desk lamp with 5 lighting modes and 7 brightness levels. Features built-in 10W wireless charging pad, USB charging port, and auto-off timer. Eye-caring technology reduces eye strain. Perfect for home office or study desk."
    },
]

ADDITIONAL_PRODUCTS = [
    {
        "name": "Memory Foam Travel Pillow",
        "category": "Fashion & Accessories",
        "price": 12000,
        "quantity": 60,
        "description": "Ergonomic memory foam neck pillow with adjustable buckle and soft velour cover. Includes carrying pouch and earplugs. Perfect for long flights, road trips, or office use."
    },
    {
        "name": "Wireless Gaming Mouse",
        "category": "Electronics",
        "price": 15000,
        "quantity": 85,
        "description": "RGB wireless gaming mouse with 6 programmable buttons and 16000 DPI sensor. Features 2.4GHz wireless connection, 50-hour battery life, and durable switches rated for 20 million clicks."
    },
    {
        "name": "Air Fryer 4.5L",
        "category": "Home & Kitchen",
        "price": 55000,
        "quantity": 30,
        "description": "Digital air fryer with 4.5L capacity and 8 preset cooking functions. Uses 85% less oil, features rapid air circulation technology, and includes non-stick basket and recipe book."
    },
    {
        "name": "Yoga Mat with Carrying Strap",
        "category": "Fashion & Accessories",
        "price": 9500,
        "quantity": 100,
        "description": "Eco-friendly TPE yoga mat with non-slip surface and excellent cushioning. Features alignment lines, moisture-resistant material, and includes carrying strap. Perfect for yoga, pilates, or floor exercises."
    },
    {
        "name": "USB Desk Fan",
        "category": "Home & Kitchen",
        "price": 5500,
        "quantity": 120,
        "description": "Quiet 5-inch USB desk fan with 3 speed settings and 180° adjustable head. Features energy-efficient motor, whisper-quiet operation, and stable non-slip base. Perfect for office, home, or travel."
    },
    {
        "name": "Phone Camera Lens Kit",
        "category": "Electronics",
        "price": 12500,
        "quantity": 70,
        "description": "Professional 3-in-1 phone camera lens kit including wide-angle, macro, and fisheye lenses. Features precision optics, aluminum construction, and universal clip compatible with all smartphones."
    },
    {
        "name": "Stainless Steel Water Bottle 1L",
        "category": "Fashion & Accessories",
        "price": 9800,
        "quantity": 95,
        "description": "Premium 1-liter stainless steel water bottle with vacuum insulation. Keeps drinks cold for 24 hours or hot for 12 hours. Features leak-proof lid, powder-coated finish, and wide mouth for easy cleaning."
    },
    {
        "name": "Wireless Charging Pad",
        "category": "Electronics",
        "price": 8500,
        "quantity": 110,
        "description": "Fast wireless charging pad compatible with all Qi-enabled devices. Features 10W fast charging for Samsung, 7.5W for iPhone, and 5W for other devices. Includes LED indicator and non-slip surface."
    },
    {
        "name": "Non-Stick Frying Pan 28cm",
        "category": "Home & Kitchen",
        "price": 12500,
        "quantity": 65,
        "description": "Professional-grade non-stick frying pan with durable granite coating. Features heat-resistant handle, even heat distribution, and is dishwasher safe. PFOA-free and suitable for all stovetops including induction."
    },
    {
        "name": "Resistance Bands Set",
        "category": "Fashion & Accessories",
        "price": 7500,
        "quantity": 140,
        "description": "5-piece resistance band set with varying resistance levels from extra light to extra heavy. Includes door anchor, ankle straps, and carrying bag. Perfect for home workouts, stretching, and physical therapy."
    },
    {
        "name": "Webcam with Privacy Cover",
        "category": "Electronics",
        "price": 22000,
        "quantity": 45,
        "description": "1080p HD webcam with built-in microphone and automatic light correction. Features privacy shutter, flexible clip for laptops/monitors, and 75° field of view. Plug-and-play with USB connectivity."
    },
    {
        "name": "Coffee Grinder Electric",
        "category": "Home & Kitchen",
        "price": 18500,
        "quantity": 50,
        "description": "Electric coffee grinder with stainless steel blades and 200W motor. Grinds enough beans for 12 cups in seconds. Features safety lock system, compact design, and easy-clean removable bowl."
    },
    {
        "name": "Silicone Baking Mat Set",
        "category": "Home & Kitchen",
        "price": 6500,
        "quantity": 160,
        "description": "2-piece non-stick silicone baking mat set. Reusable alternative to parchment paper, fits standard half-sheet baking pans. Temperature resistant from -40°F to 480°F, dishwasher safe, and includes measurement markings."
    },
    {
        "name": "USB-C Hub Adapter",
        "category": "Electronics",
        "price": 19500,
        "quantity": 80,
        "description": "7-in-1 USB-C hub with 4K HDMI, 100W power delivery, SD/TF card readers, and 3 USB 3.0 ports. Plug-and-play design, compatible with MacBook, iPad Pro, Dell XPS, and other USB-C devices."
    },
    {
        "name": "Aromatherapy Essential Oil Diffuser",
        "category": "Home & Kitchen",
        "price": 13500,
        "quantity": 75,
        "description": "500ml ultrasonic essential oil diffuser with 7 LED light colors and auto shut-off. Runs for up to 10 hours, covers up to 300 sq ft. Whisper-quiet operation perfect for bedroom, office, or yoga studio."
    },
    {
        "name": "Car Phone Mount",
        "category": "Electronics",
        "price": 4500,
        "quantity": 200,
        "description": "Universal car phone mount with strong suction cup and adjustable air vent clip. 360° rotating head for optimal viewing angle, one-touch release mechanism, compatible with all smartphones."
    },
    {
        "name": "Microfiber Cleaning Cloths",
        "category": "Home & Kitchen",
        "price": 2500,
        "quantity": 300,
        "description": "12-pack of premium microfiber cleaning cloths. Lint-free and scratch-proof, perfect for screens, glasses, lenses, and delicate surfaces. Machine washable and reusable, each cloth measures 12x12 inches."
    },
    {
        "name": "Bluetooth FM Transmitter",
        "category": "Electronics",
        "price": 8500,
        "quantity": 90,
        "description": "Bluetooth FM transmitter for car with hands-free calling and USB charging. Supports MP3 playback from USB drives, displays song information, and has 3 adjustable frequencies for clear sound."
    },
    {
        "name": "Food Storage Containers Set",
        "category": "Home & Kitchen",
        "price": 9500,
        "quantity": 120,
        "description": "24-piece airtight food storage container set with locking lids. Includes various sizes from 4oz to 50oz, BPA-free plastic, stackable design, and dishwasher safe. Perfect for meal prep and pantry organization."
    },
    {
        "name": "Laptop Cooling Pad",
        "category": "Electronics",
        "price": 11500,
        "quantity": 70,
        "description": "Laptop cooling pad with 6 quiet fans and adjustable height settings. Suitable for 15-17 inch laptops, features dual USB ports, blue LED lights, and ergonomic design to improve airflow and reduce overheating."
    },
    {
        "name": "Digital Kitchen Scale",
        "category": "Home & Kitchen",
        "price": 5500,
        "quantity": 110,
        "description": "Precision digital kitchen scale with 11lb/5kg capacity and 1g accuracy. Features tare function, easy-to-read LCD display, and automatic shut-off. Stainless steel platform and includes 2 AAA batteries."
    },
]


# ============================================
# HELPER FUNCTIONS
# ============================================

def get_image_files(folder_path):
    """Get all image files from a folder, sorted alphabetically."""
    image_extensions = {'.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif'}
    image_files = []
    
    if not folder_path.exists():
        return []
    
    for file_path in sorted(folder_path.iterdir()):
        if file_path.is_file() and file_path.suffix.lower() in image_extensions:
            image_files.append(file_path)
    
    return image_files


def create_product_with_images(product_data, static_base_path):
    """Create a product and attach all images from its folder."""
    folder_name = product_data.get("folder")
    
    # Check if product already exists by name
    if Product.objects.filter(name=product_data["name"]).exists():
        print(f"  ⏭️  SKIPPED: Product '{product_data['name']}' already exists")
        return None
    
    # Create the product
    product = Product.objects.create(
        name=product_data["name"],
        category=product_data["category"],
        price=product_data["price"],
        quantity=product_data["quantity"],
        description=product_data["description"],
        is_active=True
    )
    
    print(f"  ✅ Created: {product.name} (ID: {product.id})")
    
    # Handle images if folder exists
    if folder_name:
        # Look for Stock Pics in the gitignore folder at project root
        project_root = static_base_path.parent
        folder_path = project_root / "../gitignore" / "Stock Pics" / folder_name
        
        if folder_path.exists():
            image_files = get_image_files(folder_path)
            
            if image_files:
                print(f"     📸 Found {len(image_files)} image(s)")
                
                for idx, image_path in enumerate(image_files):
                    try:
                        with open(image_path, 'rb') as img_file:
                            django_file = File(img_file, name=image_path.name)
                            product_image = ProductImage.objects.create(
                                product=product,
                                image=django_file,
                                is_primary=(idx == 0)  # First image is primary
                            )
                            print(f"        ✓ Added: {image_path.name} {'(primary)' if idx == 0 else ''}")
                    except Exception as e:
                        print(f"        ✗ Failed to upload {image_path.name}: {str(e)}")
            else:
                print(f"     ⚠️  No images found in folder: {folder_name}")
        else:
            print(f"     ⚠️  Folder not found: {folder_name}")
    else:
        print(f"     📝 No images attached (product without images)")
    
    return product


def create_product_without_images(product_data):
    """Create a product without images."""
    if Product.objects.filter(name=product_data["name"]).exists():
        print(f"  ⏭️  SKIPPED: Product '{product_data['name']}' already exists")
        return None
    
    product = Product.objects.create(
        name=product_data["name"],
        category=product_data["category"],
        price=product_data["price"],
        quantity=product_data["quantity"],
        description=product_data["description"],
        is_active=True
    )
    
    print(f"  ✅ Created: {product.name} (ID: {product.id}) - No images")
    return product


# ============================================
# MAIN SCRIPT
# ============================================

def main():
    print("\n" + "=" * 70)
    print(" PRODUCT IMPORT SCRIPT")
    print("=" * 70)
    
    # Define paths
    base_dir = Path(__file__).resolve().parent
    static_base_path = base_dir / "static"
    
    # Check for Stock Pics in gitignore folder at project root
    project_root = static_base_path.parent
    stock_pics_path = project_root / "../gitignore" / "Stock Pics"
    
    if not stock_pics_path.exists():
        print(f"\n⚠️  WARNING: 'gitignore/Stock Pics' folder not found at:")
        print(f"   {stock_pics_path}")
        print("\n   Images will not be imported, but products will still be created.")
        proceed = input("\n   Continue without images? (y/n): ")
        if proceed.lower() != 'y':
            print("   Aborted.")
            return
    
    print(f"\n📁 Base directory: {base_dir}")
    print(f"📁 Project root: {project_root}")
    print(f"📁 Stock Pics path: {stock_pics_path}")
    
    # Create products with images
    print("\n" + "-" * 70)
    print("📦 CREATING PRODUCTS WITH IMAGES")
    print("-" * 70)
    
    products_created = 0
    for product_data in PRODUCTS_DATA:
        result = create_product_with_images(product_data, static_base_path)
        if result:
            products_created += 1
    
    # Create additional products without images
    print("\n" + "-" * 70)
    print("📦 CREATING ADDITIONAL PRODUCTS (NO IMAGES)")
    print("-" * 70)
    
    for product_data in ADDITIONAL_PRODUCTS:
        result = create_product_without_images(product_data)
        if result:
            products_created += 1
    
    # Summary
    print("\n" + "=" * 70)
    print(" IMPORT COMPLETE")
    print("=" * 70)
    print(f"\n✅ Total products created: {products_created}")
    print(f"   - Products with images: {len([p for p in PRODUCTS_DATA if p.get('folder')])}")
    print(f"   - Additional products: {len(ADDITIONAL_PRODUCTS)}")
    
    total_products = Product.objects.count()
    print(f"\n📊 Total products in database now: {total_products}")
    
    print("\n💡 TIP: Run 'python manage.py shell' and use:")
    print("   from core.models import Product")
    print("   Product.objects.all()")
    print("   To verify products were created.\n")


if __name__ == "__main__":
    main()