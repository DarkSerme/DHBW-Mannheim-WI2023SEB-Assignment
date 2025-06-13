class LightbulbController {
    constructor() {
        this.isOn = false;
        this.brightness = 50;
        this.hue = 60;
        this.saturation = 100;
        this.lightness = 50;
        this.morseInterval = null;
        this.apiBaseUrl = 'http://localhost:3000';
        
        this.initializeElements();
        this.bindEvents();
        this.updateDisplay();
    }

    initializeElements() {
        this.lightbulb = document.getElementById('lightbulb');
        this.powerToggle = document.getElementById('powerToggle');
        this.brightnessInput = document.getElementById('brightness');
        this.hueInput = document.getElementById('hue');
        this.saturationInput = document.getElementById('saturation');
        this.lightnessInput = document.getElementById('lightness');
        this.morseInput = document.getElementById('morseInput');
        this.sendMorseBtn = document.getElementById('sendMorse');
        this.morseOutput = document.getElementById('morseOutput');
        this.morseStatus = document.getElementById('morseStatus');
        this.confirmBrightnessBtn = document.getElementById('confirmBrightness');
        this.confirmColorBtn = document.getElementById('confirmColor');
        this.colorPreview = document.getElementById('colorPreview');
        
        this.brightnessValue = document.getElementById('brightnessValue');
        this.hueValue = document.getElementById('hueValue');
        this.saturationValue = document.getElementById('saturationValue');
        this.lightnessValue = document.getElementById('lightnessValue');
    }

    bindEvents() {
        this.powerToggle.addEventListener('change', () => this.togglePower());
        this.brightnessInput.addEventListener('input', () => this.updateLocalDisplay());
        this.hueInput.addEventListener('input', () => this.updateColorPreview());
        this.saturationInput.addEventListener('input', () => this.updateColorPreview());
        this.lightnessInput.addEventListener('input', () => this.updateColorPreview());
        this.confirmBrightnessBtn.addEventListener('click', () => this.confirmBrightness());
        this.confirmColorBtn.addEventListener('click', () => this.confirmColor());
        this.sendMorseBtn.addEventListener('click', () => this.startMorseCode());
    }

    morseCodeMap = {  
        'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.', 'G': '--.', 'H': '....', 'I': '..', 'J': '.---',
        'K': '-.-', 'L': '.-..', 'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.', 'S': '...', 'T': '-',
        'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-', 'Y': '-.--', 'Z': '--..',
        '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
        '.': '.-.-.-', ',': '--..--', '?': '..--..', "'": '.----.', '!': '-.-.--', '/': '-..-.', '(': '-.--.', ')': '-.--.-', '&': '.-...',
        ':': '---...', ';': '-.-.-.', '=': '-...-', '+': '.-.-.', '-': '-....-', '_': '..--.-', '"': '.-..-.', '$': '...-..-', '@': '.--.-.',
        ' ': '/'
    };

    textToMorse(text) {
        return text.toUpperCase().split('').map(char => 
            this.morseCodeMap[char] || ''
        ).join(' ');
    }

    async apiCall(endpoint, data = null) {
        try {
            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            };
            if (data) {
                options.body = JSON.stringify(data);
            }
            
            const response = await fetch(`${this.apiBaseUrl}${endpoint}`, options);
            const result = await response.json();
            return result;
        } catch (error) {
            console.error(`API Call ${endpoint} failed:`, error);
            throw error;
        }
    }

    async togglePower() {
        this.isOn = this.powerToggle.checked;
        
        try {
            if (this.isOn) {
                await this.apiCall('/on', { value: this.brightness });
                console.log('Glühbirne eingeschaltet (API)');
            } else {
                await this.apiCall('/off', { value: this.brightness });
                console.log('Glühbirne ausgeschaltet (API)');
            }
        } catch (error) {
            console.error('Fehler beim Umschalten der Glühbirne:', error);

            this.powerToggle.checked = !this.isOn;
            this.isOn = !this.isOn;
        }
        
        this.updateDisplay();
    }

    async confirmBrightness() {
        const value = parseInt(this.brightnessInput.value);
        if (isNaN(value) || value < 0 || value > 100) {
            alert('Bitte geben Sie einen gültigen Helligkeitswert zwischen 0 und 100 ein.');
            return;
        }
        
        this.brightness = value;
        
        try {
            await this.apiCall('/brightness', { value: this.brightness });
            console.log(`Helligkeit bestätigt: ${this.brightness}% (API)`);
        } catch (error) {
            console.error('Fehler beim Setzen der Helligkeit:', error);
        }
        
        this.updateDisplay();
    }

    async confirmColor() {
        const hue = parseInt(this.hueInput.value) || 0;
        const saturation = parseInt(this.saturationInput.value) || 0;
        const lightness = parseInt(this.lightnessInput.value) || 50;
        
        if (hue < 0 || hue > 360 || saturation < 0 || saturation > 100 || lightness < 0 || lightness > 100) {
            alert('Bitte geben Sie gültige Werte ein:\nFarbton: 0-360°\nSättigung: 0-100%\nFarb-Helligkeit: 0-100%');
            return;
        }
        
        this.hue = hue;
        this.saturation = saturation;
        this.lightness = lightness;
        
        const colorValue = {
            hue: this.hue,
            saturation: this.saturation,
            lightness: this.lightness
        };
        
        try {
            await this.apiCall('/color', { value: colorValue });
            console.log(`Farbe bestätigt: HSL(${this.hue}, ${this.saturation}%, ${this.lightness}%) (API)`);
        } catch (error) {
            console.error('Fehler beim Setzen der Farbe:', error);
        }
        
        this.updateDisplay();
    }

    updateColorPreview() {
        const hue = parseInt(this.hueInput.value) || 0;
        const saturation = parseInt(this.saturationInput.value) || 0;
        const lightness = parseInt(this.lightnessInput.value) || 50;
        
        const hslColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        this.colorPreview.style.backgroundColor = hslColor;
    }

    updateLocalDisplay() {
        // Lokale Anzeige ohne API-Call aktualisieren
        const brightness = parseInt(this.brightnessInput.value) || 0;
        if (this.isOn && brightness >= 0 && brightness <= 100) {
            const actualLightness = (this.lightness * brightness) / 100;
            const color = `hsl(${this.hue}, ${this.saturation}%, ${actualLightness}%)`;
            const glowColor = `hsl(${this.hue}, ${this.saturation}%, ${Math.min(actualLightness + 20, 90)}%)`;
            
            const bulb = this.lightbulb.querySelector('.bulb');
            bulb.style.background = color;
            bulb.style.boxShadow = `0 0 ${brightness/2}px ${glowColor}`;
        }
    }

    async setBrightness(value) {
        this.brightness = parseInt(value);
        this.updateDisplay();
    }

    setHue(value) {
        this.hue = parseInt(value);
        this.updateDisplay();
    }

    setSaturation(value) {
        this.saturation = parseInt(value);
        this.updateDisplay();
    }

    setLightness(value) {
        this.lightness = parseInt(value);
        this.updateDisplay();
    }

    async updateColor() {
        this.updateDisplay();
    }

    updateDisplay() {
        if (this.isOn) {
            this.lightbulb.classList.add('on');
            
            const actualLightness = (this.lightness * this.brightness) / 100;
            
            const color = `hsl(${this.hue}, ${this.saturation}%, ${actualLightness}%)`;
            const glowColor = `hsl(${this.hue}, ${this.saturation}%, ${Math.min(actualLightness + 20, 90)}%)`;
            
            const bulb = this.lightbulb.querySelector('.bulb');
            bulb.style.background = color;
            bulb.style.boxShadow = `0 0 ${this.brightness/2}px ${glowColor}`;
        } else {
            this.lightbulb.classList.remove('on');
            const bulb = this.lightbulb.querySelector('.bulb');
            bulb.style.background = '#f0f0f0';
            bulb.style.boxShadow = 'none';
        }
    }

    async startMorseCode() {
        const text = this.morseInput.value.trim();
        if (!text) return;

        const morseCode = this.textToMorse(text);
        this.morseOutput.textContent = morseCode;
        this.morseStatus.textContent = 'Sende Morse Code...';
        

        try {
            await this.apiCall('/morse', { value: text });
            this.morseStatus.textContent = 'Morse Code gesendet';
        } catch (error) {
            this.morseStatus.textContent = 'Fehler beim Senden des Morse Codes';
        }
    }
}

// Initialisiere den Controller wenn die Seite geladen ist
document.addEventListener('DOMContentLoaded', () => {
    const controller = new LightbulbController();
    controller.updateColorPreview();
});