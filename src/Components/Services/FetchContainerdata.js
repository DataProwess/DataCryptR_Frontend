// Fetching TimeZones

// Services/timeZoneService.js

export const updateUserTimezone = async (API_URL, csrfToken, email, timezone) => {
  try {
    const response = await fetch(`${API_URL}/update-usertimezone/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,
      },
      body: JSON.stringify({
        email: email,
        timezone: timezone,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed with status ${response.status}`);
    }

    return await response.json(); // optional depending on API
  } catch (error) {
    console.error("Service Error (updateUserTimezone):", error);
    throw error;
  }
};