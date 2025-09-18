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
