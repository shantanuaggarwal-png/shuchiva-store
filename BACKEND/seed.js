const mongoose = require('mongoose');
const Product = require('./models/Product'); 

// Your exact MongoDB connection string
const mongoURI = "mongodb+srv://unclejeesamazon_db_user:1Q91pnEE9iiJjBgw@cluster0.i5dd1js.mongodb.net/?retryWrites=true&w=majority";

// Your frontend data
const allProducts = {
    // --- PRODUCT 1: MULTIPURPOSE CLOTH WEFT 400 GSM ---
    multipurposeCloth: {
        categoryId: ["multipurpose", "skinCare", "opticalCare"], 
        productName: "Shuchiva Essentials Microfiber Multipurpose Cleaning Cloths",
        catalogDescription: "Skin Care (Also), Multi-Color, 400 GSM, Weft Silky Finish, Soft Absorbent Towels, 80% Polyester and 20% Polyamide",
        catalogSizesText: "Sizes: 40x60 cm & 50x90 cm | 2, 3, 4 Pc Packs",
        startingPrice: "From ₹230",
        sizes: {
            "40x60": {
                folderName: "40x60 WEFT 400 GSM",
                sizeText: "40 cm x 60 cm",
                packs: {
                    "2pc": { price: "₹1", link: "https://www.amazon.in/SHUCHIVA-ESSENTIALS-Multipurpose-400-GSM/dp/B0HHS7T2H5...", mainImg: "main-2pc.webp" },
                    "3pc": { price: "₹284", link: "https://www.amazon.in/SHUCHIVA-ESSENTIALS-Multipurpose-400-GSM/dp/B0HHSDH4F5...", mainImg: "main-3pc.webp" },
                    "4pc": { price: "₹338", link: "https://www.amazon.in/SHUCHIVA-ESSENTIALS-Multipurpose-400-GSM/dp/B0HHSBMX5B...", mainImg: "main-4pc.webp" }
                },
                thumbs: ["main-2pc.webp", "thumb1.webp", "thumb2.webp", "thumb3.webp", "thumb4.webp", "thumb5.webp", "thumb6.webp", "thumb7.webp", "thumb8.webp", "thumb9.webp", "thumb10.webp", "thumb11.webp"]
            },
            "50x90": {
                folderName: "50x90 WEFT 400 GSM",
                sizeText: "50 cm x 90 cm",
                packs: {
                    "2pc": { price: "₹347", link: "https://www.amazon.in/SHUCHIVA-ESSENTIALS-Multipurpose-400-GSM/dp/B0HHSFPGSY...", mainImg: "main-2pc.webp" },
                    "3pc": { price: "₹455", link: "https://www.amazon.in/SHUCHIVA-ESSENTIALS-Multipurpose-400-GSM/dp/B0HHSJ7ZKJ...", mainImg: "main-3pc.webp" },
                    "4pc": { price: "₹567", link: "https://www.amazon.in/SHUCHIVA-ESSENTIALS-Multipurpose-400-GSM/dp/B0HHS821L7...", mainImg: "main-4pc.webp" }
                },
                thumbs: ["main-2pc.webp", "thumb1.webp", "thumb2.webp", "thumb3.webp", "thumb4.webp", "thumb5.webp", "thumb6.webp", "thumb7.webp", "thumb8.webp", "thumb9.webp", "thumb10.webp", "thumb11.webp"]
            }
        }
    },

    // --- PRODUCT 2: CORAL FLEECE 550 GSM ---
    coralFleece: {
        categoryId: ["multipurpose", "opticalCare", "automobileCleaning"],
        productName: "SHUCHIVA ESSENTIALS Microfiber Cleaning Cloth, Edgeless Ultrasonic Cut",
        catalogDescription: "Multicolour, 550 GSM, Scratch-Free Quick Drying, Multipurpose Car Bike Cleaning Towel, Assorted Colours",
        catalogSizesText: "Sizes: 40x40 cm & 40x60 cm | 2, 3, 4 Pc Packs",
        startingPrice: "From ₹242",
        sizes: {
            "40x40": {
                folderName: "40x40 CORAL FLEECE 550 GSM",
                sizeText: "40 cm x 40 cm",
                packs: {
                    "2pc": { price: "₹242", link: "https://www.amazon.in/dp/B0HFYKT3RB?th=1", mainImg: "main-2pc.webp" },
                    "3pc": { price: "₹300", link: "https://www.amazon.in/dp/B0HFYNFYCM?th=1", mainImg: "main-3pc.webp" },
                    "4pc": { price: "₹359", link: "https://www.amazon.in/dp/B0HFYB1H1Q?th=1", mainImg: "main-4pc.webp" }
                },
                thumbs: ["main-2pc.webp", "thumb1.webp", "thumb2.webp", "thumb3.webp", "thumb4.webp", "thumb5.webp", "thumb6.webp", "thumb7.webp", "thumb8.webp", "thumb9.webp", "thumb10.webp", "thumb11.webp"]
            },
            "40x60": {
                folderName: "40X60 CORAL FLEECE 550 GSM",
                sizeText: "40 cm x 60 cm",
                packs: {
                    "2pc": { price: "₹296", link: "https://www.amazon.in/dp/B0HFYX2QCQ?th=1", mainImg: "main-2pc.webp" },
                    "3pc": { price: "₹381", link: "https://www.amazon.in/dp/B0HFYDFGYF?th=1", mainImg: "main-3pc.webp" },
                    "4pc": { price: "₹467", link: "https://www.amazon.in/dp/B0HFY99D1K?th=1", mainImg: "main-4pc.webp" }
                },
                thumbs: ["main-2pc.webp", "thumb1.webp", "thumb2.webp", "thumb3.webp", "thumb4.webp", "thumb5.webp", "thumb6.webp", "thumb7.webp", "thumb8.webp", "thumb9.webp", "thumb10.webp", "thumb11.webp"]
            }
        }
    },

    // --- PRODUCT 3: DUAL CORAL FLEECE 800 GSM ---
    dualCoralFleece: {
        categoryId: ["multipurpose", "cleaningPurpose", "automobileCleaning"], 
        productName: "Shuchiva Essentials Microfiber Cleaning Multipurpose Cloth, Dual-Sided, High Density Short Pile, 800 GSM",
        catalogDescription: "Dual-Sided, High Density Short Pile, 800 GSM, Assorted Colors",
        catalogSizesText: "Sizes: 40x40 cm & 40x60 cm | 2, 3, 4 Pc Packs",
        startingPrice: "From ₹300",
        sizes: {
            "40x40": {
                folderName: "40x40 DUAL CORAL FLEECE 800 GSM",
                sizeText: "40 cm x 40 cm",
                packs: {
                    "2pc": { price: "₹300", link: "https://www.amazon.in/dp/B0HH3NR6KR?th=1", mainImg: "main-2pc.webp" },
                    "3pc": { price: "₹380", link: "https://www.amazon.in/dp/B0HH3GF8HY?th=1", mainImg: "main-3pc.webp" },
                    "4pc": { price: "₹460", link: "https://www.amazon.in/dp/B0HH3KCQBX?th=1", mainImg: "main-4pc.webp" }
                },
                thumbs: ["main-2pc.webp", "thumb1.webp", "thumb2.webp", "thumb3.webp", "thumb4.webp", "thumb5.webp", "thumb6.webp", "thumb7.webp", "thumb8.webp", "thumb9.webp", "thumb10.webp", "thumb11.webp"]
            },
            "40x60": {
                folderName: "40x60 DUAL CORAL FLEECE 800 GSM",
                sizeText: "40 cm x 60 cm",
                packs: {
                    "2pc": { price: "₹350", link: "https://www.amazon.in/dp/B0HH3QVDYX?th=1", mainImg: "main-2pc.webp" },
                    "3pc": { price: "₹470", link: "https://www.amazon.in/dp/B0HH3KQ17X?th=1", mainImg: "main-3pc.webp" },
                    "4pc": { price: "₹580", link: "https://www.amazon.in/dp/B0HH3GZQTH?th=1", mainImg: "main-4pc.webp" }
                },
                thumbs: ["main-2pc.webp", "thumb1.webp", "thumb2.webp", "thumb3.webp", "thumb4.webp", "thumb5.webp", "thumb6.webp", "thumb7.webp", "thumb8.webp", "thumb9.webp", "thumb10.webp", "thumb11.webp"]
            }
        }
    }
};

// Execution Sequence
mongoose.connect(mongoURI)
    .then(async () => {
        console.log('Connected to MongoDB for Migration...');
        
        // Clear any existing products to prevent duplicates during testing
        await Product.deleteMany({});
        
        // Transform your frontend object into an array of database documents
        const productsArray = Object.keys(allProducts).map(key => {
            return {
                productId: key,
                ...allProducts[key]
            };
        });

        // Push data to Atlas
        await Product.insertMany(productsArray);
        console.log('Migration Complete! All products successfully uploaded to Atlas.');
        
        // Close connection safely
        mongoose.connection.close();
    })
    .catch(err => {
        console.error('Migration failed:', err);
    });