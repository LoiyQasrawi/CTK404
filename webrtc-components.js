AFRAME.registerComponent('camera-stream', {
    schema: {
        resolution: {
            type: 'vec2',
            default: {x: 1280, y: 720}
        }
    },

    init: function() {
        this.stream = null;
        this.peerConnection = null;
        this.setupWebRTC();
    },

    setupWebRTC: async function() {
        try {
            // Get user media (camera)
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: this.data.resolution.x },
                    height: { ideal: this.data.resolution.y },
                    facingMode: 'environment'
                }
            });

            // Create peer connection
            this.peerConnection = new RTCPeerConnection({
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' }
                ]
            });

            // Add tracks to peer connection
            this.stream.getTracks().forEach(track => {
                this.peerConnection.addTrack(track, this.stream);
            });

            // Create video element and texture
            const video = document.createElement('video');
            video.setAttribute('autoplay', '');
            video.setAttribute('playsinline', '');
            video.srcObject = this.stream;
            
            // Create video texture and set as scene background
            const texture = new THREE.VideoTexture(video);
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.format = THREE.RGBAFormat;
            
            const scene = this.el.sceneEl;
            scene.object3D.background = texture;

            // Handle connection state changes
            this.peerConnection.onconnectionstatechange = () => {
                console.log("WebRTC State:", this.peerConnection.connectionState);
            };

            console.log('Camera stream initialized');
            
        } catch (error) {
            console.error('Failed to initialize camera stream:', error);
        }
    },

    remove: function() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }
        if (this.peerConnection) {
            this.peerConnection.close();
        }
    }
});