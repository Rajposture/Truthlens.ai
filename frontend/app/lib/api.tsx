
const API_URL = "http://127.0.0.1:8000";

export async function verifyClaim(
  claim: string
) {
  const response = await fetch(
    `${API_URL}/verify`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        claim,
      }),
    }
  );

  return response.json();
}