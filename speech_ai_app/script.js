// script.js - Speech-to-Text Functionality

class SpeechToTextApp {
    constructor() {
        this.recognition = null;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.isRecording = false;
        this.transcript = '';
        
        this.initElements();
        this.initSpeechRecognition();
        this.initThemeToggle();
        this.bindEvents();
    }

    initElements() {
        this.startBtn = document.getElementById('startRecord');
        this.stopBtn = document.getElementById('stopRecord');
        this.status = document.getElementById('status');
        this.transcriptEl = document.getElementById('transcript');
        this.audioFile = document.getElementById('audioFile');
        this.processUploadBtn = document.getElementById('processUpload');
        this.copyBtn = document.getElementById('copyTranscript');
        this.downloadBtn = document.getElementById('downloadTranscript');
        this.clearBtn = document.getElementById('clearTranscript');
        this.themeToggle = document.getElementById('themeToggle');
        this.audioPlayer = document.getElementById('audioPlayer');
    }

    initSpeechRecognition() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            this.status.textContent = 'Speech Recognition not supported in this browser.';
            this.startBtn.disabled = true;
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        this.recognition.onstart = () => {
            this.status.textContent = 'Listening... Speak now!';
            this.status.classList.add('recording');
            this.startBtn.classList.add('recording', 'hidden');
            this.stopBtn.classList.remove('hidden');
        };

        this.recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = this.transcript;

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript + ' ';
                } else {
                    interimTranscript += transcript;
                }
            }

            this.transcript = finalTranscript;
            this.transcriptEl.value = this.transcript + interimTranscript;
            this.transcriptEl.scrollTop = this.transcriptEl.scrollHeight;
        };

        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.stopListening();
            this.status.textContent = `Error: ${event.error}`;
        };

        this.recognition.onend = () => {
            this.stopListening();
        };
    }

    initThemeToggle() {
        const isDark = localStorage.getItem('theme') === 'dark';
        document.body.classList.toggle('dark', isDark);
        this.themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    }

    bindEvents() {
        this.startBtn.addEventListener('click', () => this.startListening());
        this.stopBtn.addEventListener('click', () => this.stopListening());

        this.audioFile.addEventListener('change', (e) => {
            if (e.target.files[0]) {
                this.processUploadBtn.classList.remove('hidden');
            }
        });

        this.processUploadBtn.addEventListener('click', () => this.processUploadedFile());

        this.copyBtn.addEventListener('click', () => this.copyTranscript());
        this.downloadBtn.addEventListener('click', () => this.downloadTranscript());
        this.clearBtn.addEventListener('click', () => this.clearTranscript());

        this.themeToggle.addEventListener('click', () => this.toggleTheme());
    }

    async startListening() {
        try {
            await navigator.mediaDevices.getUserMedia({ audio: true });
            this.recognition.start();
        } catch (err) {
            this.status.textContent = 'Microphone access denied.';
            console.error('Mic error:', err);
        }
    }

    stopListening() {
        if (this.recognition) {
            this.recognition.stop();
        }
        this.status.classList.remove('recording');
        this.status.textContent = 'Stopped. Click "Start Listening" to continue.';
        this.startBtn.classList.remove('recording', 'hidden');
        this.stopBtn.classList.add('hidden');
    }

    async processUploadedFile() {
        const file = this.audioFile.files[0];
        if (!file) return;

        this.status.textContent = 'Processing uploaded audio... (Note: Live STT on upload uses browser playthrough)';
        
        const url = URL.createObjectURL(file);
        this.audioPlayer.src = url;
        
        // Simulate transcription by playing and using live recognition (limited support)
        // For full upload STT, would need Web Audio API + advanced processing or server
        this.audioPlayer.play();
        setTimeout(() => {
            this.startListening(); // Trigger live STT while playing
            this.audioPlayer.addEventListener('ended', () => this.stopListening(), { once: true });
        }, 500);
    }

    copyTranscript() {
        navigator.clipboard.writeText(this.transcriptEl.value).then(() => {
            this.status.textContent = 'Copied to clipboard!';
            setTimeout(() => this.status.textContent = '', 2000);
        });
    }

    downloadTranscript() {
        const blob = new Blob([this.transcriptEl.value], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'transcript.txt';
        a.click();
        URL.revokeObjectURL(url);
    }

    clearTranscript() {
        this.transcript = '';
        this.transcriptEl.value = '';
        this.status.textContent = 'Transcript cleared.';
    }

    toggleTheme() {
        document.body.classList.toggle('dark');
        const isDark = document.body.classList.contains('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        this.themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    }
}

// Initialize app when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    new SpeechToTextApp();
});

