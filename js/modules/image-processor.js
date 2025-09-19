// Image Processing Module for GPS and OCR
const ImageProcessor = {
    // Initialize image processor
    init() {
        console.log('ImageProcessor initialized');
        this.loadEXIFLibrary();
    },

    // Load EXIF library dynamically
    loadEXIFLibrary() {
        if (typeof EXIF === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/exif-js';
            script.onload = () => {
                console.log('EXIF library loaded');
            };
            document.head.appendChild(script);
        }
    },

    // Process uploaded image for GPS and OCR
    async processImage(file) {
        try {
            const results = {
                gpsData: null,
                ocrText: null,
                imageData: null,
                error: null
            };

            // Read file as data URL
            const imageData = await this.readFileAsDataURL(file);
            results.imageData = imageData;

            // Extract GPS data from EXIF
            const gpsData = await this.extractGPSData(file);
            results.gpsData = gpsData;

            // If no GPS data from EXIF, try OCR to find coordinates in text
            if (!gpsData) {
                const ocrData = await this.extractCoordinatesFromText(file);
                if (ocrData) {
                    results.gpsData = ocrData;
                }
            }

            return results;
        } catch (error) {
            console.error('Error processing image:', error);
            return {
                gpsData: null,
                ocrText: null,
                imageData: null,
                error: error.message
            };
        }
    },

    // Read file as data URL
    readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsDataURL(file);
        });
    },

    // Extract GPS data from EXIF (only from photos taken with GPS camera)
    async extractGPSData(file) {
        try {
            console.log('Starting GPS extraction for file:', file.name);
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const img = new Image();
                    img.onload = function() {
                        console.log('Image loaded, checking for EXIF library...');
                        if (typeof EXIF !== 'undefined') {
                            console.log('EXIF library found, extracting GPS data...');
                            EXIF.getData(img, function() {
                                const lat = EXIF.getTag(this, "GPSLatitude");
                                const lon = EXIF.getTag(this, "GPSLongitude");
                                const latRef = EXIF.getTag(this, "GPSLatitudeRef");
                                const lonRef = EXIF.getTag(this, "GPSLongitudeRef");

                                console.log('GPS data from EXIF:', { lat, lon, latRef, lonRef });

                                if (lat && lon && latRef && lonRef) {
                                    const latDec = ImageProcessor.convertDMSToDD(lat, latRef);
                                    const lonDec = ImageProcessor.convertDMSToDD(lon, lonRef);
                                    
                                    console.log('Converted coordinates:', { latDec, lonDec });
                                    
                                    // Validate coordinates are within reasonable bounds
                                    if (latDec && lonDec && 
                                        latDec >= -90 && latDec <= 90 && 
                                        lonDec >= -180 && lonDec <= 180) {
                                        
                                        console.log('Valid GPS coordinates found!');
                                        resolve({
                                            latitude: parseFloat(latDec),
                                            longitude: parseFloat(lonDec),
                                            accuracy: 'GPS Camera',
                                            source: 'EXIF'
                                        });
                                    } else {
                                        console.log('Invalid GPS coordinates');
                                        resolve(null);
                                    }
                                } else {
                                    console.log('No GPS data found in EXIF');
                                    resolve(null);
                                }
                            });
                        } else {
                            console.log('EXIF library not available');
                            resolve(null);
                        }
                    };
                    img.src = e.target.result;
                };
                reader.readAsDataURL(file);
            });
        } catch (error) {
            console.warn('GPS extraction failed:', error);
            return null;
        }
    },


    // Convert DMS to Decimal Degrees
    convertDMSToDD(dms, ref) {
        if (!dms || !Array.isArray(dms) || dms.length !== 3) {
            return null;
        }
        
        const degrees = dms[0].numerator / dms[0].denominator;
        const minutes = dms[1].numerator / dms[1].denominator;
        const seconds = dms[2].numerator / dms[2].denominator;
        let dd = degrees + minutes / 60 + seconds / 3600;
        if (ref === "S" || ref === "W") dd *= -1;
        return parseFloat(dd.toFixed(6));
    },

    // Extract coordinates from text in image using OCR (improved version)
    async extractCoordinatesFromText(file) {
        try {
            console.log('Starting OCR coordinate extraction for file:', file.name);
            
            // Load Tesseract.js for OCR
            if (typeof Tesseract === 'undefined') {
                await this.loadTesseractLibrary();
            }
            
            // Wait for Tesseract to be available
            let attempts = 0;
            while (typeof Tesseract === 'undefined' && attempts < 50) {
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;
            }
            
            if (typeof Tesseract === 'undefined') {
                console.log('Tesseract library not available for OCR');
                return null;
            }
            
            // Perform OCR on the image with improved settings
            const { data: { text } } = await Tesseract.recognize(file, 'eng', {
                logger: m => {
                    if (m.status === 'recognizing text') {
                        console.log('OCR Progress:', Math.round(m.progress * 100) + '%');
                    }
                }
            });
            
            console.log('OCR extracted text:', text);
            
            // Look for coordinate patterns in the text using improved method
            const coordinates = this.findGPS(text);
            
            if (coordinates) {
                console.log('Coordinates found in text:', coordinates);
                return {
                    latitude: coordinates.lat,
                    longitude: coordinates.lng,
                    accuracy: 'OCR Text',
                    source: 'OCR'
                };
            }
            
            return null;
        } catch (error) {
            console.warn('OCR coordinate extraction failed:', error);
            return null;
        }
    },

    // Load Tesseract.js library for OCR (updated to version 5)
    loadTesseractLibrary() {
        return new Promise((resolve, reject) => {
            if (typeof Tesseract !== 'undefined') {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
            script.onload = () => {
                console.log('Tesseract library loaded');
                resolve();
            };
            script.onerror = () => {
                console.error('Failed to load Tesseract library');
                reject(new Error('Failed to load Tesseract library'));
            };
            document.head.appendChild(script);
        });
    },

    // Parse coordinates from text using improved regex patterns (based on provided code)
    parseCoordinatesFromText(text) {
        if (!text) return null;
        
        // Clean the text
        const cleanText = text.replace(/\s+/g, ' ').trim();
        console.log('Cleaning text for coordinate parsing:', cleanText);
        
        // Use the improved regex patterns from the provided code
        const coords = this.findGPS(cleanText);
        if (coords) {
            console.log('Valid coordinates found:', coords);
            return coords;
        }
        
        console.log('No valid coordinates found in text');
        return null;
    },

    // Improved GPS finding function (based on provided code)
    findGPS(text) {
        // Pattern 1: Basic decimal degrees with comma or space
        let regex1 = /(-?\d{1,2}\.\d+)[°\s,]+(-?\d{1,3}\.\d+)/;
        let match = text.match(regex1);
        if (match) {
            const lat = parseFloat(match[1]);
            const lng = parseFloat(match[2]);
            if (this.isValidCoordinate(lat, lng)) {
                return { lat, lng };
            }
        }

        // Pattern 2: Latitude/Longitude labels
        let regex2 = /Lat(?:itude)?[:\s]*(-?\d{1,2}\.\d+)[°\sNnSs]*.*?Long(?:itude)?[:\s]*(-?\d{1,3}\.\d+)[°\sEeWw]*/;
        match = text.match(regex2);
        if (match) {
            const lat = parseFloat(match[1]);
            const lng = parseFloat(match[2]);
            if (this.isValidCoordinate(lat, lng)) {
                return { lat, lng };
            }
        }

        // Pattern 3: DMS format with degrees, minutes, seconds
        let regex3 = /(\d{1,2})°\s*(\d{1,2})['′]\s*(\d{1,2}(?:\.\d+)?)["″]?\s*([NS])[, ]+\s*(\d{1,3})°\s*(\d{1,2})['′]\s*(\d{1,2}(?:\.\d+)?)["″]?\s*([EW])/;
        match = text.match(regex3);
        if (match) {
            let lat = this.dmsToDecimal(+match[1], +match[2], +match[3], match[4]);
            let lon = this.dmsToDecimal(+match[5], +match[6], +match[7], match[8]);
            if (this.isValidCoordinate(lat, lon)) {
                return { lat, lng: lon };
            }
        }

        // Pattern 4: Additional common formats
        const additionalPatterns = [
            // GPS format: GPS: 40.7128, -74.0060
            /gps:\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)/gi,
            // Coordinates format: Coordinates: 40.7128, -74.0060
            /coord[inates]?:\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)/gi,
            // Location format: Location: 40.7128, -74.0060
            /location:\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)/gi,
            // With N/S/E/W: 40.7128 N, 74.0060 W
            /(-?\d+\.?\d*)\s*[NS]\s*,?\s*(-?\d+\.?\d*)\s*[EW]/gi,
            // Google Maps format: 40.7128°N, 74.0060°W
            /(-?\d+\.?\d*)°[NS]\s*,?\s*(-?\d+\.?\d*)°[EW]/gi,
            // Space separated: 40.7128 -74.0060
            /(-?\d+\.?\d*)\s+(-?\d+\.?\d*)/g,
            // With parentheses: (40.7128, -74.0060)
            /\((-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\)/g,
            // With brackets: [40.7128, -74.0060]
            /\[(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\]/g,
            // With quotes: "40.7128, -74.0060"
            /"(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)"/g,
            // With single quotes: '40.7128, -74.0060'
            /'(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)'/g,
            // With semicolon: 40.7128; -74.0060
            /(-?\d+\.?\d*)\s*;\s*(-?\d+\.?\d*)/g,
            // With pipe: 40.7128 | -74.0060
            /(-?\d+\.?\d*)\s*\|\s*(-?\d+\.?\d*)/g,
            // With colon: 40.7128: -74.0060
            /(-?\d+\.?\d*)\s*:\s*(-?\d+\.?\d*)/g,
            // With tab or multiple spaces: 40.7128    -74.0060
            /(-?\d+\.?\d*)\s{2,}(-?\d+\.?\d*)/g
        ];
        
        for (const pattern of additionalPatterns) {
            const matches = [...text.matchAll(pattern)];
            for (const match of matches) {
                const lat = parseFloat(match[1]);
                const lng = parseFloat(match[2]);
                
                if (this.isValidCoordinate(lat, lng)) {
                    return { lat, lng };
                } else if (this.isValidCoordinate(lng, lat)) {
                    // Try swapped coordinates
                    return { lat: lng, lng: lat };
                }
            }
        }

        return null;
    },

    // Convert DMS to Decimal Degrees (from provided code)
    dmsToDecimal(deg, min, sec, ref) {
        let dd = deg + min/60 + sec/3600;
        if (ref === "S" || ref === "W") dd *= -1;
        return parseFloat(dd.toFixed(6));
    },

    // Validate if coordinates are within valid ranges
    isValidCoordinate(lat, lng) {
        // Basic validation
        if (isNaN(lat) || isNaN(lng) || !isFinite(lat) || !isFinite(lng)) {
            return false;
        }
        
        // Standard coordinate ranges
        if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
            return true;
        }
        
        // Sometimes coordinates might be in different formats
        // Check if they're reasonable for common locations
        if (Math.abs(lat) <= 180 && Math.abs(lng) <= 180) {
            // Might be swapped coordinates, check if they make sense
            if (Math.abs(lat) <= 90 && Math.abs(lng) <= 90) {
                // Likely swapped, but still valid range
                return true;
            }
        }
        
        return false;
    },


    // Get current location from browser
    async getCurrentLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by this browser'));
                return;
            }
            
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                        altitude: position.coords.altitude,
                        timestamp: new Date().toISOString(),
                        source: 'Browser GPS'
                    });
                },
                (error) => {
                    reject(error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 60000
                }
            );
        });
    },

    // Validate image file
    validateImageFile(file) {
        const maxSize = Config.MAX_FILE_SIZE || 5 * 1024 * 1024; // 5MB
        const allowedTypes = Config.ALLOWED_IMAGE_TYPES || ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        
        if (!allowedTypes.includes(file.type)) {
            throw new Error('Invalid file type. Please upload an image file.');
        }
        
        if (file.size > maxSize) {
            throw new Error(`File too large. Maximum size is ${Utils.formatFileSize(maxSize)}.`);
        }
        
        return true;
    }
};

// Make ImageProcessor globally available
window.ImageProcessor = ImageProcessor;
