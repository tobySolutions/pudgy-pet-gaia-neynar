import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const testMessage = searchParams.get('message') || 'Hello, can you respond as a cute Pudgy penguin pet?';
  
  console.log('Testing Gaia AI with message:', testMessage);
  
  const endpoints = [
    'https://0xecb625ec1121a9e2afca79fbb767ce8455b56c4e.gaia.domains/v1/chat/completions',
    'https://0xecb625ec1121a9e2afca79fbb767ce8455b56c4e.gaia.domains/chat/completions',
    'https://0xecb625ec1121a9e2afca79fbb767ce8455b56c4e.gaia.domains/v1/completions',
    'https://0xecb625ec1121a9e2afca79fbb767ce8455b56c4e.gaia.domains/completions',
    'https://0xecb625ec1121a9e2afca79fbb767ce8455b56c4e.gaia.domains/',
    'https://0xecb625ec1121a9e2afca79fbb767ce8455b56c4e.gaia.domains/api/chat'
  ];

  const testResults = [];

  for (const endpoint of endpoints) {
    console.log(`Testing endpoint: ${endpoint}`);
    
    const testConfigs = [
      // OpenAI-style format
      {
        model: 'gaia',
        messages: [
          { role: 'user', content: testMessage }
        ],
        temperature: 0.8,
        max_tokens: 100
      },
      // Simple prompt format
      {
        prompt: testMessage,
        max_tokens: 100,
        temperature: 0.8
      },
      // Text format
      {
        text: testMessage,
        max_length: 100
      },
      // Message format
      {
        message: testMessage
      }
    ];

    for (let i = 0; i < testConfigs.length; i++) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(testConfigs[i])
        });

        const responseText = await response.text();
        let responseData;
        try {
          responseData = JSON.parse(responseText);
        } catch {
          responseData = responseText;
        }

        testResults.push({
          endpoint,
          config: i + 1,
          status: response.status,
          headers: Object.fromEntries(response.headers.entries()),
          response: responseData,
          success: response.ok
        });

        if (response.ok) {
          console.log(`SUCCESS with endpoint ${endpoint} and config ${i + 1}`);
          break; // Found a working combination
        }
      } catch (error) {
        testResults.push({
          endpoint,
          config: i + 1,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
  }

  return NextResponse.json({
    message: 'Gaia AI endpoint test results',
    testMessage,
    results: testResults
  });
}

export async function POST(request: Request) {
  try {
    const { endpoint, config } = await request.json();
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(config)
    });

    const responseText = await response.text();
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = responseText;
    }

    return NextResponse.json({
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      response: responseData
    });
    
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
