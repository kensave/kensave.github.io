import { pipeline } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers';

// Simple WebGL test first
const canvas = document.getElementById('fluidCanvas');
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

if (!gl) {
    document.body.style.background = 'linear-gradient(45deg, #0a0a2e, #16213e, #0f3460)';
} else {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Simple test - just clear to red to see if WebGL works
    gl.clearColor(1.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    // If red appears, WebGL is working
    setTimeout(() => {
        startWaterAnimation();
    }, 1000);
}

function startWaterAnimation() {
    const vertexShader = `
    attribute vec2 position;
    void main() {
        gl_Position = vec4(position, 0.0, 1.0);
    }`;

    const fragmentShader = `
    precision mediump float;
    uniform vec2 resolution;
    
    float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }
    
    void main() {
        vec2 uv = gl_FragCoord.xy / resolution.xy;
        
        // Create stars
        vec2 starField = uv * 50.0;
        vec2 starId = floor(starField);
        vec2 starPos = fract(starField);
        
        float star = 0.0;
        float starBrightness = random(starId);
        if (starBrightness > 0.95) {
            float dist = distance(starPos, vec2(0.5));
            star = 1.0 - smoothstep(0.0, 0.1, dist);
        }
        
        // Create nebula background
        vec3 nebula = vec3(
            0.1 + 0.3 * sin(uv.x * 3.0 + uv.y * 2.0),
            0.05 + 0.2 * cos(uv.x * 2.0 - uv.y * 3.0),
            0.2 + 0.4 * sin(uv.x * 4.0 + uv.y * 1.5)
        );
        
        // Combine nebula and stars
        vec3 space = nebula + vec3(star * 0.8);
        
        gl_FragColor = vec4(space, 1.0);
    }`;

    function createShader(type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('Shader compile error:', gl.getShaderInfoLog(shader));
            return null;
        }
        return shader;
    }

    const program = gl.createProgram();
    const vShader = createShader(gl.VERTEX_SHADER, vertexShader);
    const fShader = createShader(gl.FRAGMENT_SHADER, fragmentShader);

    if (vShader && fShader) {
        gl.attachShader(program, vShader);
        gl.attachShader(program, fShader);
        gl.linkProgram(program);
        
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('Program link error:', gl.getProgramInfoLog(program));
            return;
        }
        console.log('Program linked successfully');
        gl.useProgram(program);
    } else {
        console.error('Failed to create shaders');
        return;
    }

    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const position = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const timeLocation = gl.getUniformLocation(program, 'time');
    const resolutionLocation = gl.getUniformLocation(program, 'resolution');

    function render() {
        gl.viewport(0, 0, canvas.width, canvas.height);
        
        if (resolutionLocation !== null) {
            gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
        }
        
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        requestAnimationFrame(render);
    }

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });

    render();
}

// Terminal with AI Worker
const terminalOutput = document.getElementById('terminal-output');
const terminalInput = document.getElementById('terminal-input');

// Create worker for AI processing
const worker = new Worker('./worker.js?v=4', { type: 'module' });
let aiReady = false;

// Kenneth's detailed context
const KENNETH_CONTEXT = `Kenneth Sanchez is a Software Development Engineer II at Amazon Web Services (AWS), currently working on AWS Q Developer CLI - Agentic AI in Bellevue, Washington.

Professional Experience:
- AWS Q Developer CLI - Agentic AI (September 2023 - Present): Software Development Engineer II
- Amazon Alexa Shopping (August 2022 - September 2023): Software Development Engineer II  
- Microsoft Edge Browser (December 2021 - August 2022): Software Engineer II in San Jose, Costa Rica
- Amazon Seller Services (February 2019 - December 2021): Software Development Engineer II
- Mobilize.Net (April 2012 - February 2019): Senior Software Engineer for 6+ years

Technical Expertise:
- Languages: C#, C++, Java, JavaScript, TypeScript, TSX
- Cloud: AWS Lambda, CloudFront, serverless architecture, distributed systems
- Frontend: Angular, React, HTML5, CSS3, micro frontends
- Backend: .NET MVC, RESTful APIs, automated code manipulation
- Specializations: Language syntax parsing, code analysis tools, migration systems, performance optimization

Key Achievements:
- Created automated code migration and analysis tools that streamline development workflows
- Implemented framework improvements for high-impact core products under heavy loads
- Architected serverless solutions with minimal latency using AWS Lambda and CloudFront
- Developed search engine using NLP and ML for intelligent Wiki article parsing
- Improved Microsoft Edge enterprise results load time from 1 minute to 3 seconds
- Led HTML5 migration projects transforming VB6 and C# WinForms to web applications

Current Focus: Investigating approaches to improve coding semantic context and general semantic contexts for agents solving complex tasks. Passionate about using LLMs for seamless human-computer interaction and leveraging semantic context for agentic AI systems.

Education: Universidad de Costa Rica (UCR) - Computer Engineering (2008-2011)`;

function addToTerminal(text, className = '') {
    const line = document.createElement('div');
    line.className = `terminal-line ${className}`;
    line.innerHTML = text;
    terminalOutput.appendChild(line);
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

// Handle worker messages
let currentStreamElement = null;

worker.addEventListener('message', (event) => {
    const { type, message, data } = event.data;
    
    switch (type) {
        case 'status':
        case 'progress':
            document.getElementById('status-text').textContent = message;
            document.getElementById('status-dot').className = 'status-working';
            break;
        case 'ready':
            aiReady = true;
            document.getElementById('status-text').textContent = 'Ready';
            document.getElementById('status-dot').className = 'status-ready';
            break;
        case 'stream':
            // Not used with Q&A model
            break;
        case 'result':
            // Reset status to ready
            document.getElementById('status-text').textContent = 'Ready';
            document.getElementById('status-dot').className = 'status-ready';
            
            addToTerminal(`<span class="ai-prompt">AI ></span> ${data}`);
            addToTerminal(''); // Add spacing after AI response
            currentStreamElement = null; // Reset for next response
            break;
        case 'error':
            currentStreamElement = null;
            addToTerminal(`❌ AI Error: ${message}`);
            break;
    }
});

let currentQuestion = '';

async function handleCommand(command) {
    addToTerminal(`<span class="prompt">$</span> ${command}`);
    currentQuestion = command;
    
    const cmd = command.trim().toLowerCase();
    
    if (cmd === 'help') {
        addToTerminal('Available commands:');
        addToTerminal('  help       - Show this help');
        addToTerminal('  clear      - Clear screen');
        addToTerminal('  about      - About Kenneth');
        addToTerminal('  skills     - Technical skills');
        addToTerminal('  experience - Work experience');
        addToTerminal('  projects   - Current projects');
        addToTerminal('');
        addToTerminal('Or ask me anything about Kenneth!');
    } else if (cmd === 'clear') {
        terminalOutput.innerHTML = '';
    } else if (cmd === 'about') {
        addToTerminal('Kenneth Sanchez - Software Development Engineer II');
        addToTerminal('Currently: AWS Q Developer CLI - Agentic AI');
        addToTerminal('Location: Bellevue, Washington');
        addToTerminal('Specialization: Automated code manipulation & language parsing');
        addToTerminal('Focus: LLMs and semantic context for agentic AI systems');
    } else if (cmd === 'skills') {
        addToTerminal('Technical Skills:');
        addToTerminal('• Languages: C#, C++, Java, JavaScript, TypeScript');
        addToTerminal('• Cloud: AWS Lambda, CloudFront, serverless architecture');
        addToTerminal('• Frontend: Angular, React, HTML5, micro frontends');
        addToTerminal('• Backend: .NET MVC, RESTful APIs, code analysis tools');
    } else if (cmd === 'experience') {
        addToTerminal('Professional Experience:');
        addToTerminal('AWS Q Developer CLI (2023-Present) - SDE II');
        addToTerminal('  • Working on Agentic AI for developer tools');
        addToTerminal('Amazon Alexa Shopping (2022-2023) - SDE II');
        addToTerminal('Microsoft Edge Browser (2021-2022) - SWE II');
        addToTerminal('  • Improved enterprise results load time from 1min to 3sec');
        addToTerminal('Amazon Seller Services (2019-2021) - SDE II');
        addToTerminal('  • Created scalable solutions for Sellers & Associates');
        addToTerminal('  • Built AWS Lambda & CloudFront micro frontends');
        addToTerminal('Mobilize.Net (2012-2019) - Senior Software Engineer');
        addToTerminal('  • Led HTML5 migration projects and automated tools');
    } else if (cmd === 'projects') {
        addToTerminal('Key Projects & Achievements:');
        addToTerminal('• AWS Q Developer CLI - Agentic AI development');
        addToTerminal('• Automated code migration and analysis tools');
        addToTerminal('• Microsoft Edge enterprise search optimization');
        addToTerminal('• Serverless solutions with AWS Lambda & CloudFront');
        addToTerminal('• NLP/ML search engine for Wiki article parsing');
    } else if (cmd !== '') {
        if (!aiReady) {
            addToTerminal('🤖 AI model still loading, please wait...');
            return;
        }
        
        // Update status to working
        document.getElementById('status-text').textContent = 'Working';
        document.getElementById('status-dot').className = 'status-working';
        
        // Send to worker for processing with conversation format
        const systemPrompt = `Kenneth Sanchez is a Software Development Engineer II at Amazon Web Services (AWS), currently working on AWS Q Developer CLI - Agentic AI in Bellevue, Washington.

Professional Summary: Currently at Amazon Web Services working on AWS Q Developer CLI, specializing in automated code manipulation and language syntax parsing. Expert in serverless architecture and distributed systems with a passion for LLMs and semantic context for agentic AI. Created agentic solutions for semantic understanding of conversations and context optimization.

Technical Skills:
Languages: C# • C++ • Java • JavaScript • TypeScript • Rust
Technologies: AWS Serverless • ECS • CloudFront • Micro-Frontends • Angular • React
Specializations: Code Analysis • Migration Tools • Performance Optimization • Semantic Context

Major Achievements:
• Patent & Publication: Created A/B Testing core engine with consistent hashing mechanism - https://aws.amazon.com/blogs/devops/how-a-b-testing-and-multi-model-hosting-accelerate-generative-ai-feature-development-in-amazon-q/
• Semantic Search Innovation: Developed local file system semantic search for terminal - https://dev.to/aws/manage-context-rot-by-exploring-new-experimental-features-in-amazon-q-cli-10ki
• MCP Server: Built widely popular Model Context Protocol server for natural language queries
• App Slicer: Created tool for rapid migration demos in modern web platforms
• Technical Leadership: Led teams across Seattle, Los Angeles, Colombia, India, and Costa Rica
• Microsoft Edge: Improved enterprise search load times from 1 minute to 3 seconds

Personal Projects:
• LanguageSyntaxCreator: Pattern matching and JSON grammar parser - https://github.com/kensave/LanguageSyntaxCreator
• RobertoMCP: Language agnostic code analysis MCP server - https://github.com/kensave/roberto-mcp


Professional Experience:
- AWS Q Developer CLI - Agentic AI (September 2023 - Present): Software Development Engineer II
- Amazon Alexa Shopping (August 2022 - September 2023): Software Development Engineer II  
- Microsoft Edge Browser (December 2021 - August 2022): Software Engineer II in San Jose, Costa Rica
- Amazon Seller Services (February 2019 - December 2021): Software Development Engineer II
- Mobilize.Net (April 2012 - February 2019): Senior Software Engineer for 6+ years

Education: Universidad de Costa Rica (UCR) - Computer Engineering (2008-2011)

Contact: Bellevue, Washington | LinkedIn: https://www.linkedin.com/in/kenneth-sanchez-0b894b42 | GitHub: https://github.com/kensave/`;
        
        worker.postMessage({
            type: 'generate',
            data: {
                systemPrompt: systemPrompt,
                query: command,
                messages: [],
                maxTokens: 150,
                temperature: 0.7
            }
        });
    }
}

terminalInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const command = terminalInput.value;
        if (command.trim()) {
            handleCommand(command);
        }
        terminalInput.value = '';
    }
});

// Initialize
addToTerminal('🚀 Kenneth\'s AI-Powered Terminal');
addToTerminal('Type "help" for commands or ask me anything!');
addToTerminal('');

// Focus terminal and initialize worker
setTimeout(() => {
    terminalInput.focus();
    worker.postMessage({ type: 'init' });
}, 100);
