
// app.js (Final Clean Groq Version)

const tools = [
  {
    type: "function",
    function: {
      name: "calculate_foir",
      description: "Calculate Fixed Obligation to Income Ratio (FOIR).",
      parameters: {
        type: "object",
        properties: {
          income: { type: "number", description: "Monthly income" },
          existing_emi: { type: "number", description: "Current monthly EMIs" },
          new_loan_emi: { type: "number", description: "Estimated EMI for the new loan" }
        },
        required: ["income", "existing_emi", "new_loan_emi"]
      }
    }
  }
];

async function callGroq(applicant) {
    const systemPrompt = `You are a Senior Credit Officer AI Agent for a bank. 
  Review the applicant data. 
  If documents are missing (Aadhar, PAN, Salary Slip, Bank Statement are required), flag it.
  Use the 'calculate_foir' tool to calculate the FOIR. (Assume new loan EMI is roughly loanAmount / 60).
  FOIR Rule: Total EMI (existing + new) should not exceed 50% of income. CIBIL should ideally be > 700.
  Once you have the tool result, output a final recommendation: APPROVE, REJECT, or REFER TO HUMAN. Provide bullet points explaining WHY, citing the FOIR, CIBIL, and document check.
  
  IMPORTANT: When showing the math for FOIR, use plain text (e.g., 23,333 / 80,000 * 100 = 29.17%). Do NOT use LaTeX, \frac{}{}, or markdown math brackets like [ ].`;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": "Bearer YOUR_API_KEY", // <--- PASTE KEY HERE (1/2)
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "model": "openai/gpt-oss-120b", 
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: JSON.stringify(applicant) }
      ],
      tools: tools
    })
  });

  const data = await response.json();
  
  // THIS WILL SHOW US THE EXACT GROQ ERROR IF IT FAILS
  if (!response.ok) {
    throw new Error(data.error ? data.error.message : "Failed to connect to Groq");
  }

  return data;
}

async function evaluateApplicant(index) {
  const app = applicants[index];
  const outputDiv = document.getElementById("agent-output");
  
  outputDiv.innerHTML = `<p class="loading">🤖 Agent is reasoning, checking policy, and calling tools...</p>`;

  try {
    let response = await callGroq(app);
    let message = response.choices[0].message;

    // Check if Groq decided to use the tool
    if (message.tool_calls && message.tool_calls.length > 0) {
      const toolCall = message.tool_calls[0];
      
      const args = JSON.parse(toolCall.function.arguments);
      const foir = (((args.existing_emi + args.new_loan_emi) / args.income) * 100).toFixed(2);
      
      // Send the tool result back to Groq
      const finalResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": "Bearer YOUR_API_KEY", // <--- PASTE KEY HERE (2/2)
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "model": "openai/gpt-oss-120b",
          messages: [
            { role: "system", content: "You are a Senior Credit Officer AI Agent." },
            { role: "user", content: JSON.stringify(app) },
            message,
            {
              role: "tool",
              tool_call_id: toolCall.id,
              name: toolCall.function.name,
              content: JSON.stringify({ calculated_foir_percentage: foir })
            }
          ]
        })
      });

      const finalData = await finalResponse.json();
      
      if (!finalResponse.ok) {
        throw new Error(finalData.error ? finalData.error.message : "Groq failed on second step");
      }

      const textOutput = finalData.choices[0].message.content;
      
      outputDiv.innerHTML = `<div class="ai-response">${marked.parse(textOutput)}</div>`;
            // Display the result
      outputDiv.innerHTML = `<div class="ai-response">${marked.parse(textOutput)}</div>`;
      
      // SHOW THE GREEN BUTTON
      const btn = document.getElementById('human-approve-btn');
      if (btn) btn.style.display = 'block';
      
    }
     else {
      outputDiv.innerHTML = `<div class="ai-response">${message.content}</div>`;
      
    }
  } catch (error) {
    // THIS SHOWS THE ERROR ON THE SCREEN
    outputDiv.innerHTML = `<p style="color:red"><b>System Error:</b> ${error.message}</p>`;
  }
}

function approveLoan() {
    alert("✅ Loan Sanctioned! The human credit officer has reviewed the AI's recommendation and approved the loan.");
    document.getElementById('human-approve-btn').style.display = 'none';
}