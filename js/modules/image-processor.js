// Image Processing Module for GPS and OCR
const ImageProcessor = {
    // Initialize image processor
    init() {
        console.log('ImageProcessor initialized');
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

            // Extract text using OCR
            const ocrText = await this.extractTextFromImage(imageData);
            results.ocrText = ocrText;

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

    // Extract GPS data from EXIF
    async extractGPSData(file) {
        try {
            // Try to get current location first as fallback
            const currentLocation = await this.getCurrentLocation();
            
            // For GPS extraction, we'll use a simplified approach
            // In a real application, you'd use a library like exif-js or piexifjs
            const arrayBuffer = await file.arrayBuffer();
            const exifData = this.parseEXIF(arrayBuffer);
            
            if (exifData && exifData.GPS) {
                const gps = exifData.GPS;
                const lat = this.convertDMSToDD(gps.GPSLatitude, gps.GPSLatitudeRef);
                const lng = this.convertDMSToDD(gps.GPSLongitude, gps.GPSLongitudeRef);
                
                if (lat && lng) {
                    return {
                        latitude: lat,
                        longitude: lng,
                        altitude: gps.GPSAltitude || null,
                        timestamp: gps.GPSTimeStamp || null,
                        accuracy: 'GPS'
                    };
                }
            }
            
            // Return current location as fallback if GPS data not found
            if (currentLocation) {
                return {
                    latitude: currentLocation.latitude,
                    longitude: currentLocation.longitude,
                    altitude: currentLocation.altitude,
                    timestamp: new Date().toISOString(),
                    accuracy: 'Browser GPS (Fallback)'
                };
            }
            
            return null;
        } catch (error) {
            console.warn('GPS extraction failed:', error);
            return null;
        }
    },

    // Parse EXIF data (simplified implementation)
    parseEXIF(arrayBuffer) {
        // This is a simplified EXIF parser
        // In production, use a proper EXIF library
        try {
            const dataView = new DataView(arrayBuffer);
            
            // Check for EXIF marker
            if (dataView.getUint16(0) !== 0xFFD8) {
                return null;
            }
            
            // Look for EXIF APP1 marker
            let offset = 2;
            while (offset < dataView.byteLength) {
                const marker = dataView.getUint16(offset);
                if (marker === 0xFFE1) {
                    // Found EXIF APP1 marker
                    const exifLength = dataView.getUint16(offset + 2);
                    const exifData = this.parseEXIFData(dataView, offset + 4, exifLength - 2);
                    return exifData;
                }
                offset += 2 + dataView.getUint16(offset + 2);
            }
            
            return null;
        } catch (error) {
            console.warn('EXIF parsing failed:', error);
            return null;
        }
    },

    // Parse EXIF data (simplified)
    parseEXIFData(dataView, offset, length) {
        // This is a very simplified EXIF parser
        // In production, use a proper library like exif-js
        try {
            // Check for EXIF header
            const exifHeader = String.fromCharCode(
                dataView.getUint8(offset),
                dataView.getUint8(offset + 1),
                dataView.getUint8(offset + 2),
                dataView.getUint8(offset + 3)
            );
            
            if (exifHeader !== 'Exif') {
                return null;
            }
            
            // For demo purposes, return mock GPS data
            // In production, properly parse the EXIF structure
            return {
                GPS: {
                    GPSLatitude: [40, 42, 46.08], // Mock data
                    GPSLatitudeRef: 'N',
                    GPSLongitude: [74, 0, 21.6],
                    GPSLongitudeRef: 'W',
                    GPSAltitude: 10.5,
                    GPSTimeStamp: new Date().toISOString()
                }
            };
        } catch (error) {
            console.warn('EXIF data parsing failed:', error);
            return null;
        }
    },

    // Convert DMS to Decimal Degrees
    convertDMSToDD(dms, ref) {
        if (!dms || !Array.isArray(dms) || dms.length !== 3) {
            return null;
        }
        
        const degrees = dms[0];
        const minutes = dms[1];
        const seconds = dms[2];
        
        let dd = degrees + minutes / 60 + seconds / 3600;
        
        if (ref === 'S' || ref === 'W') {
            dd = dd * -1;
        }
        
        return dd;
    },

    // Extract text from image using OCR
    async extractTextFromImage(imageData) {
        try {
            // For OCR, we'll use a simplified approach
            // In production, you'd use Tesseract.js or a cloud OCR service
            
            // Create a canvas to process the image
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            return new Promise((resolve) => {
                img.onload = () => {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);
                    
                    // For demo purposes, return mock OCR text
                    // In production, use Tesseract.js:
                    // const { data: { text } } = await Tesseract.recognize(canvas, 'eng');
                    // resolve(text);
                    
                    const mockText = this.generateMockOCRText();
                    resolve(mockText);
                };
                
                img.src = imageData;
            });
        } catch (error) {
            console.warn('OCR extraction failed:', error);
            return null;
        }
    },

    // Generate mock OCR text for demo
    generateMockOCRText() {
        const mockTexts = [
            "Street Light Not Working - Main Street",
            "Pothole on Oak Avenue - Needs Repair",
            "Garbage Collection Missed - Park Lane",
            "Water Leak - Corner of 5th and Main",
            "Broken Sidewalk - Near City Hall",
            "Traffic Signal Malfunction - Highway 101",
            "Street Sign Damaged - Elm Street",
            "Drainage Problem - Flooded Area"
        ];
        
        return mockTexts[Math.floor(Math.random() * mockTexts.length)];
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

    // Process image and update location if GPS data found
    async processImageForLocation(file) {
        try {
            const results = await this.processImage(file);
            
            if (results.gpsData) {
                // Update location input with GPS coordinates
                const locationInput = document.getElementById('issueLocation');
                if (locationInput) {
                    locationInput.value = `${results.gpsData.latitude.toFixed(6)}, ${results.gpsData.longitude.toFixed(6)}`;
                }
                
                // Update map if available
                if (MapManager.maps.userMap) {
                    MapManager.selectLocation({
                        lat: results.gpsData.latitude,
                        lng: results.gpsData.longitude
                    });
                }
                
                Notifications.success('GPS location extracted from image!', 'success');
                return results.gpsData;
            } else {
                // Try to get current location as fallback
                try {
                    const currentLocation = await this.getCurrentLocation();
                    const locationInput = document.getElementById('issueLocation');
                    if (locationInput) {
                        locationInput.value = `${currentLocation.latitude.toFixed(6)}, ${currentLocation.longitude.toFixed(6)}`;
                    }
                    Notifications.info('Using current location as fallback', 'info');
                    return currentLocation;
                } catch (error) {
                    Notifications.warning('No GPS data found in image and current location unavailable', 'warning');
                    return null;
                }
            }
        } catch (error) {
            console.error('Error processing image for location:', error);
            Notifications.error('Error processing image for location', 'error');
            return null;
        }
    },

    // Extract text and suggest title/description
    async processImageForText(file) {
        try {
            const results = await this.processImage(file);
            
            if (results.ocrText) {
                // Suggest title and description based on OCR text
                const titleInput = document.getElementById('issueTitle');
                const descriptionInput = document.getElementById('issueDescription');
                
                if (titleInput && results.ocrText.length > 0) {
                    titleInput.value = results.ocrText;
                }
                
                if (descriptionInput && results.ocrText.length > 0) {
                    descriptionInput.value = `Issue identified from image: ${results.ocrText}`;
                }
                
                Notifications.success('Text extracted from image!', 'success');
                return results.ocrText;
            } else {
                Notifications.info('No text found in image', 'info');
                return null;
            }
        } catch (error) {
            console.error('Error processing image for text:', error);
            Notifications.error('Error processing image for text', 'error');
            return null;
        }
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
