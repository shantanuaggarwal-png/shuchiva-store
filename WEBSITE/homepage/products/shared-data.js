// --- CATEGORY METADATA ---
const categories = {
    multipurpose: {
        title: "Multipurpose Cloths",
        description: "Versatile, high-GSM microfiber cloths designed for cleaning any surface without scratching."
    },
    cleaningPurpose: {
        title: "Only Cleaning Purpose",
        description: "Heavy-duty cleaning cloths tailored for tough stains, grime, and deep cleaning."
    },
    skinCare: {
        title: "Skin Care",
        description: "Ultra-soft, gentle microfiber face and body towels for your daily skincare routine."
    },
    opticalCare: {
        title: "Optical Care",
        description: "Premium lint-free cloths for safely cleaning glasses, camera lenses, and screens."
    },
    automobileCleaning: {
        title: "Automobile Cleaning",
        description: "Professional-grade detailing towels for washing, drying, and polishing your car or bike."
    }
};

// --- PRODUCT DATABASE ---
const allProducts = {
    // --- PRODUCT 1: MULTIPURPOSE CLOTH WEFT 400 GSM ---
    multipurposeCloth: {
        // Tagged for Multipurpose, Skin Care, and Optical Care
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
                    "2pc": { price: "₹230", link: "https://www.amazon.in/SHUCHIVA-ESSENTIALS-Multipurpose-400-GSM/dp/B0HHS7T2H5/ref=sr_1_17?dib=eyJ2IjoiMSJ9.oJFLUKxvKQzlu3DSaWnEUG1zf-F1MbBS_VBhbF-FA0Au19Z5wUvyUWlNgzwUC7KG1wkXaArNXpj2I4qv44sntwl6CWSQKPmy5VpEWfp22YZBKuBgy3XOUnDADOCFABSpGbAInC6MfWUXiD711yqwX8hIYSZI7EzFx3VFXYSzu2jA2jEigI48HvWKnjRpI_I-lSqR08QeUS_0QD9v0zaAH9vLSrkTvstO4oB--sudLs9_FYxgdrm759Q_age9xlty7CPhpnyVnYJ1zB0oi5osKUeyVnm3P0R1uKxXUscv5cg.um7CIW_4KE5MybVCu63ldRv31KX6z1KMQajdkeUXWdw&dib_tag=se&keywords=SHUCHIVA%2BESSENTIALS&qid=1788702016&sr=8-17&th=1", mainImg: "main-2pc.png" },
                    "3pc": { price: "₹284", link: "https://www.amazon.in/SHUCHIVA-ESSENTIALS-Multipurpose-400-GSM/dp/B0HHSDH4F5/ref=sr_1_16?dib=eyJ2IjoiMSJ9.oJFLUKxvKQzlu3DSaWnEUG1zf-F1MbBS_VBhbF-FA0Au19Z5wUvyUWlNgzwUC7KG1wkXaArNXpj2I4qv44sntwl6CWSQKPmy5VpEWfp22YZBKuBgy3XOUnDADOCFABSpGbAInC6MfWUXiD711yqwX8hIYSZI7EzFx3VFXYSzu2jA2jEigI48HvWKnjRpI_I-lSqR08QeUS_0QD9v0zaAH9vLSrkTvstO4oB--sudLs9_FYxgdrm759Q_age9xlty7CPhpnyVnYJ1zB0oi5osKUeyVnm3P0R1uKxXUscv5cg.um7CIW_4KE5MybVCu63ldRv31KX6z1KMQajdkeUXWdw&dib_tag=se&keywords=SHUCHIVA%2BESSENTIALS&qid=1788704549&sr=8-16&th=1", mainImg: "main-3pc.png" },
                    "4pc": { price: "₹338", link: "https://www.amazon.in/SHUCHIVA-ESSENTIALS-Multipurpose-400-GSM/dp/B0HHSBMX5B/ref=sr_1_16?dib=eyJ2IjoiMSJ9.oJFLUKxvKQzlu3DSaWnEUG1zf-F1MbBS_VBhbF-FA0Au19Z5wUvyUWlNgzwUC7KG1wkXaArNXpj2I4qv44sntwl6CWSQKPmy5VpEWfp22YZBKuBgy3XOUnDADOCFABSpGbAInC6MfWUXiD711yqwX8hIYSZI7EzFx3VFXYSzu2jA2jEigI48HvWKnjRpI_I-lSqR08QeUS_0QD9v0zaAH9vLSrkTvstO4oB--sudLs9_FYxgdrm759Q_age9xlty7CPhpnyVnYJ1zB0oi5osKUeyVnm3P0R1uKxXUscv5cg.um7CIW_4KE5MybVCu63ldRv31KX6z1KMQajdkeUXWdw&dib_tag=se&keywords=SHUCHIVA%2BESSENTIALS&qid=1788704549&sr=8-16&th=1", mainImg: "main-4pc.png" }
                },
                thumbs: ["main-2pc.png", "thumb1.png", "thumb2.png", "thumb3.png", "thumb4.png", "thumb5.png", "thumb6.png", "thumb7.png", "thumb8.png", "thumb9.png", "thumb10.png", "thumb11.png"]
            },
            "50x90": {
                folderName: "50x90 WEFT 400 GSM",
                sizeText: "50 cm x 90 cm",
                packs: {
                    "2pc": { price: "₹347", link: "https://www.amazon.in/SHUCHIVA-ESSENTIALS-Multipurpose-400-GSM/dp/B0HHSFPGSY/ref=sr_1_16?dib=eyJ2IjoiMSJ9.oJFLUKxvKQzlu3DSaWnEUG1zf-F1MbBS_VBhbF-FA0Au19Z5wUvyUWlNgzwUC7KG1wkXaArNXpj2I4qv44sntwl6CWSQKPmy5VpEWfp22YZBKuBgy3XOUnDADOCFABSpGbAInC6MfWUXiD711yqwX8hIYSZI7EzFx3VFXYSzu2jA2jEigI48HvWKnjRpI_I-lSqR08QeUS_0QD9v0zaAH9vLSrkTvstO4oB--sudLs9_FYxgdrm759Q_age9xlty7CPhpnyVnYJ1zB0oi5osKUeyVnm3P0R1uKxXUscv5cg.um7CIW_4KE5MybVCu63ldRv31KX6z1KMQajdkeUXWdw&dib_tag=se&keywords=SHUCHIVA%2BESSENTIALS&qid=1788704549&sr=8-16&th=1", mainImg: "main-2pc.png" },
                    "3pc": { price: "₹455", link: "https://www.amazon.in/SHUCHIVA-ESSENTIALS-Multipurpose-400-GSM/dp/B0HHSJ7ZKJ/ref=sr_1_16?dib=eyJ2IjoiMSJ9.oJFLUKxvKQzlu3DSaWnEUG1zf-F1MbBS_VBhbF-FA0Au19Z5wUvyUWlNgzwUC7KG1wkXaArNXpj2I4qv44sntwl6CWSQKPmy5VpEWfp22YZBKuBgy3XOUnDADOCFABSpGbAInC6MfWUXiD711yqwX8hIYSZI7EzFx3VFXYSzu2jA2jEigI48HvWKnjRpI_I-lSqR08QeUS_0QD9v0zaAH9vLSrkTvstO4oB--sudLs9_FYxgdrm759Q_age9xlty7CPhpnyVnYJ1zB0oi5osKUeyVnm3P0R1uKxXUscv5cg.um7CIW_4KE5MybVCu63ldRv31KX6z1KMQajdkeUXWdw&dib_tag=se&keywords=SHUCHIVA%2BESSENTIALS&qid=1788704549&sr=8-16&th=1", mainImg: "main-3pc.png" },
                    "4pc": { price: "₹567", link: "https://www.amazon.in/SHUCHIVA-ESSENTIALS-Multipurpose-400-GSM/dp/B0HHS821L7/ref=sr_1_16?dib=eyJ2IjoiMSJ9.oJFLUKxvKQzlu3DSaWnEUG1zf-F1MbBS_VBhbF-FA0Au19Z5wUvyUWlNgzwUC7KG1wkXaArNXpj2I4qv44sntwl6CWSQKPmy5VpEWfp22YZBKuBgy3XOUnDADOCFABSpGbAInC6MfWUXiD711yqwX8hIYSZI7EzFx3VFXYSzu2jA2jEigI48HvWKnjRpI_I-lSqR08QeUS_0QD9v0zaAH9vLSrkTvstO4oB--sudLs9_FYxgdrm759Q_age9xlty7CPhpnyVnYJ1zB0oi5osKUeyVnm3P0R1uKxXUscv5cg.um7CIW_4KE5MybVCu63ldRv31KX6z1KMQajdkeUXWdw&dib_tag=se&keywords=SHUCHIVA%2BESSENTIALS&qid=1788704549&sr=8-16&th=1", mainImg: "main-4pc.png" }
                },
                thumbs: ["main-2pc.png", "thumb1.png", "thumb2.png", "thumb3.png", "thumb4.png", "thumb5.png", "thumb6.png", "thumb7.png", "thumb8.png", "thumb9.png", "thumb10.png", "thumb11.png"]
            }
        }
    },

    // --- PRODUCT 2: CORAL FLEECE 550 GSM ---
    coralFleece: {
        // Tagged for Multipurpose, Optical Care, and Automobile Cleaning
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
                    "2pc": { price: "₹242", link: "https://www.amazon.in/dp/B0HFYKT3RB?th=1", mainImg: "main-2pc.png" },
                    "3pc": { price: "₹300", link: "https://www.amazon.in/dp/B0HFYNFYCM?th=1", mainImg: "main-3pc.png" },
                    "4pc": { price: "₹359", link: "https://www.amazon.in/dp/B0HFYB1H1Q?th=1", mainImg: "main-4pc.png" }
                },
                thumbs: ["main-2pc.png", "thumb1.png", "thumb2.png", "thumb3.png", "thumb4.png", "thumb5.png", "thumb6.png", "thumb7.png", "thumb8.png", "thumb9.png", "thumb10.png", "thumb11.png"]
            },
            "40x60": {
                folderName: "40X60 CORAL FLEECE 550 GSM",
                sizeText: "40 cm x 60 cm",
                packs: {
                    "2pc": { price: "₹296", link: "https://www.amazon.in/dp/B0HFYX2QCQ?th=1", mainImg: "main-2pc.png" },
                    "3pc": { price: "₹381", link: "https://www.amazon.in/dp/B0HFYDFGYF?th=1", mainImg: "main-3pc.png" },
                    "4pc": { price: "₹467", link: "https://www.amazon.in/dp/B0HFY99D1K?th=1", mainImg: "main-4pc.png" }
                },
                thumbs: ["main-2pc.png", "thumb1.png", "thumb2.png", "thumb3.png", "thumb4.png", "thumb5.png", "thumb6.png", "thumb7.png", "thumb8.png", "thumb9.png", "thumb10.png", "thumb11.png"]
            }
        }
    },

    // --- PRODUCT 3: DUAL CORAL FLEECE 800 GSM ---
    dualCoralFleece: {
        // Tagged for Multipurpose, Cleaning Purpose, AND Automobile Cleaning
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
                    "2pc": { price: "₹300", link: "https://www.amazon.in/dp/B0HH3NR6KR?th=1", mainImg: "main-2pc.png" },
                    "3pc": { price: "₹380", link: "https://www.amazon.in/dp/B0HH3GF8HY?th=1", mainImg: "main-3pc.png" },
                    "4pc": { price: "₹460", link: "https://www.amazon.in/dp/B0HH3KCQBX?th=1", mainImg: "main-4pc.png" }
                },
                thumbs: ["main-2pc.png", "thumb1.png", "thumb2.png", "thumb3.png", "thumb4.png", "thumb5.png", "thumb6.png", "thumb7.png", "thumb8.png", "thumb9.png", "thumb10.png", "thumb11.png"]
            },
            "40x60": {
                folderName: "40x60 DUAL CORAL FLEECE 800 GSM",
                sizeText: "40 cm x 60 cm",
                packs: {
                    "2pc": { price: "₹350", link: "https://www.amazon.in/dp/B0HH3QVDYX?th=1", mainImg: "main-2pc.png" },
                    "3pc": { price: "₹470", link: "https://www.amazon.in/dp/B0HH3KQ17X?th=1", mainImg: "main-3pc.png" },
                    "4pc": { price: "₹580", link: "https://www.amazon.in/dp/B0HH3GZQTH?th=1", mainImg: "main-4pc.png" }
                },
                thumbs: ["main-2pc.png", "thumb1.png", "thumb2.png", "thumb3.png", "thumb4.png", "thumb5.png", "thumb6.png", "thumb7.png", "thumb8.png", "thumb9.png", "thumb10.png", "thumb11.png"]
            }
        }
    }
};