document.addEventListener('DOMContentLoaded', () => {
    const storyForm = document.getElementById('storyForm');
    const storyContainer = document.getElementById('storyContainer');
    const storyContent = document.getElementById('storyContent');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const newStoryButton = document.getElementById('newStoryButton');
    const printStoryButton = document.getElementById('printStoryButton');
    const predefinedTopicRadio = document.getElementById('predefinedTopic');
    const customTopicRadio = document.getElementById('customTopic');
    const predefinedTopicSection = document.getElementById('predefinedTopicSection');
    const customTopicSection = document.getElementById('customTopicSection');

    // Toggle between predefined and custom topic sections
    predefinedTopicRadio.addEventListener('change', () => {
        predefinedTopicSection.style.display = 'block';
        customTopicSection.style.display = 'none';
    });

    customTopicRadio.addEventListener('change', () => {
        predefinedTopicSection.style.display = 'none';
        customTopicSection.style.display = 'block';
    });

    // Handle form submission
    storyForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Show loading indicator
        loadingIndicator.style.display = 'block';
        
        // Get form data
        const childName = document.getElementById('childName').value;
        const childAge = document.getElementById('childAge').value;
        const message = document.getElementById('message').value;
        const sideCharacters = document.getElementById('sideCharacters').value;
        
        // Get topic based on selection
        let topic;
        if (predefinedTopicRadio.checked) {
            topic = document.getElementById('predefinedTopicSelect').value;
        } else {
            topic = document.getElementById('customTopicInput').value;
        }

        // Create request payload
        const payload = {
            childName,
            childAge,
            message,
            topic,
            sideCharacters
        };

        try {
            // Send data to backend
            const response = await fetch('http://localhost:3000/create-story', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            
            // Display the story
            storyContent.innerHTML = data.story.split('\n').map(paragraph => 
                `<p>${paragraph}</p>`
            ).join('');
            
            // Hide form and show story
            storyForm.style.display = 'none';
            storyContainer.style.display = 'block';
            
            // Scroll to story
            storyContainer.scrollIntoView({ behavior: 'smooth' });
            
        } catch (error) {
            console.error('Error generating story:', error);
            alert('Hikaye oluşturulurken bir hata oluştu. Lütfen tekrar deneyiniz.');
        } finally {
            // Hide loading indicator
            loadingIndicator.style.display = 'none';
        }
    });

    // Handle new story button click
    newStoryButton.addEventListener('click', () => {
        storyForm.reset();
        storyContainer.style.display = 'none';
        storyForm.style.display = 'block';
    });

    // Handle print story button click
    printStoryButton.addEventListener('click', () => {
        const printWindow = window.open('', '_blank');
        
        // Create printable content with simple styling
        const storyTitle = `${document.getElementById('childName').value}'nin Özel Hikayesi`;
        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${storyTitle}</title>
                <style>
                    body { 
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        line-height: 1.6;
                        margin: 40px;
                        color: #333;
                    }
                    h1 { 
                        color: #6a5acd;
                        text-align: center;
                        margin-bottom: 30px;
                    }
                    .story {
                        font-size: 14pt;
                        white-space: pre-line;
                    }
                    .footer {
                        margin-top: 30px;
                        text-align: center;
                        font-size: 10pt;
                        color: #777;
                    }
                </style>
            </head>
            <body>
                <h1>${storyTitle}</h1>
                <div class="story">${storyContent.innerHTML}</div>
                <div class="footer">Kişiselleştirilmiş Masal Oluşturucu ile oluşturulmuştur.</div>
            </body>
            </html>
        `;
        
        printWindow.document.open();
        printWindow.document.write(printContent);
        printWindow.document.close();
        
        // Wait for content to load, then print
        setTimeout(() => {
            printWindow.print();
        }, 500);
    });
});