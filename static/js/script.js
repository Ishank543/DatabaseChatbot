document.getElementById('mic-button').addEventListener('click', function() {
    // Check if SpeechRecognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        document.getElementById('response-text').textContent = "Speech Recognition is not supported in this browser.";
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    document.getElementById('response-text').textContent = "Listening..."; // Show a loading message

    recognition.start();

    recognition.onresult = function(event) {
        const userText = event.results[0][0].transcript;
        document.getElementById('response-text').textContent = `You said: "${userText}"`;

        // Send the recognized text to Flask for processing
        fetch('/process_voice_input', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: userText }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                document.getElementById('response-text').textContent = `Error: ${data.error}`;
            } else {
                const resultText = data.result.join(', '); // Assuming result is an array
                document.getElementById('response-text').textContent = `SQL Query Result: ${resultText}`;

                // Create a new speech synthesis object for speaking the result
                const utterance = new SpeechSynthesisUtterance(resultText);
                speechSynthesis.speak(utterance);
            }
        })
        .catch(err => {
            // Catch any errors with the fetch call
            document.getElementById('response-text').textContent = `Fetch error: ${err.message}`;
        });
    };

    recognition.onerror = function(event) {
        document.getElementById('response-text').textContent = "Error occurred in recognition: " + event.error;
    };

    // Stop speech synthesis if a new query is being spoken
    const synth = window.speechSynthesis;
    if (synth.speaking) {
        synth.cancel();
    }
});