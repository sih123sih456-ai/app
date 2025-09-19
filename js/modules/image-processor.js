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
                                            latitude: latDec,
                                            longitude: lonDec,
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

    // Extract coordinates from text in image using OCR
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
            
            // Perform OCR on the image
            const { data: { text } } = await Tesseract.recognize(file, 'eng', {
                logger: m => console.log('OCR Progress:', m)
            });
            
            console.log('OCR extracted text:', text);
            
            // Look for coordinate patterns in the text
            const coordinates = this.parseCoordinatesFromText(text);
            
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

    // Load Tesseract.js library for OCR
    loadTesseractLibrary() {
        return new Promise((resolve, reject) => {
            if (typeof Tesseract !== 'undefined') {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/tesseract.js@4.1.1/dist/tesseract.min.js';
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

    // Parse coordinates from text using regex patterns
    parseCoordinatesFromText(text) {
        if (!text) return null;
        
        // Clean the text
        const cleanText = text.replace(/\s+/g, ' ').trim();
        console.log('Cleaning text for coordinate parsing:', cleanText);
        
        // Various coordinate patterns - more comprehensive
        const patterns = [
            // Decimal degrees: 40.7128, -74.0060
            /(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)/g,
            // With lat/lon labels: lat: 40.7128, lon: -74.0060
            /lat[itude]?:\s*(-?\d+\.?\d*).*?lon[gitude]?:\s*(-?\d+\.?\d*)/gi,
            // With N/S/E/W: 40.7128 N, 74.0060 W
            /(-?\d+\.?\d*)\s*[NS]\s*,?\s*(-?\d+\.?\d*)\s*[EW]/gi,
            // GPS format: GPS: 40.7128, -74.0060
            /gps:\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)/gi,
            // Coordinates format: Coordinates: 40.7128, -74.0060
            /coord[inates]?:\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)/gi,
            // Location format: Location: 40.7128, -74.0060
            /location:\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)/gi,
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
        
        for (const pattern of patterns) {
            const matches = [...cleanText.matchAll(pattern)];
            for (const match of matches) {
                const lat = parseFloat(match[1]);
                const lng = parseFloat(match[2]);
                
                // Validate coordinate ranges
                if (this.isValidCoordinate(lat, lng)) {
                    console.log('Valid coordinates found with pattern:', pattern, { lat, lng });
                    return { lat, lng };
                } else if (this.isValidCoordinate(lng, lat)) {
                    // Try swapped coordinates
                    console.log('Valid coordinates found (swapped):', { lat: lng, lng: lat });
                    return { lat: lng, lng: lat };
                }
            }
        }
        
        // Try to find any two numbers that could be coordinates
        const numberPattern = /(-?\d+\.?\d*)/g;
        const numbers = [...cleanText.matchAll(numberPattern)].map(m => parseFloat(m[1]));
        
        // Look for pairs of numbers that could be coordinates
        for (let i = 0; i < numbers.length - 1; i++) {
            const lat = numbers[i];
            const lng = numbers[i + 1];
            
            if (this.isValidCoordinate(lat, lng)) {
                console.log('Valid coordinate pair found:', { lat, lng });
                return { lat, lng };
            } else if (this.isValidCoordinate(lng, lat)) {
                // Try swapped coordinates
                console.log('Valid coordinate pair found (swapped):', { lat: lng, lng: lat });
                return { lat: lng, lng: lat };
            }
        }
        
        // Try to find coordinates in different formats
        const alternativePatterns = [
            // DMS format: 40°42'46.08"N, 74°0'21.6"W
            /(\d+)°(\d+)'([\d.]+)"[NS]\s*,?\s*(\d+)°(\d+)'([\d.]+)"[EW]/gi,
            // DMS without quotes: 40°42'46.08N, 74°0'21.6W
            /(\d+)°(\d+)'([\d.]+)[NS]\s*,?\s*(\d+)°(\d+)'([\d.]+)[EW]/gi
        ];
        
        for (const pattern of alternativePatterns) {
            const matches = [...cleanText.matchAll(pattern)];
            for (const match of matches) {
                const latDeg = parseInt(match[1]);
                const latMin = parseInt(match[2]);
                const latSec = parseFloat(match[3]);
                const lngDeg = parseInt(match[4]);
                const lngMin = parseInt(match[5]);
                const lngSec = parseFloat(match[6]);
                
                const lat = latDeg + latMin / 60 + latSec / 3600;
                const lng = lngDeg + lngMin / 60 + lngSec / 3600;
                
                // Apply direction
                const latDir = match[0].includes('S') ? -1 : 1;
                const lngDir = match[0].includes('W') ? -1 : 1;
                
                const finalLat = lat * latDir;
                const finalLng = lng * lngDir;
                
                if (this.isValidCoordinate(finalLat, finalLng)) {
                    console.log('Valid DMS coordinates found:', { lat: finalLat, lng: finalLng });
                    return { lat: finalLat, lng: finalLng };
                }
            }
        }
        
        console.log('No valid coordinates found in text');
        return null;
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
