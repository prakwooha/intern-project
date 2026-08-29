const token = localStorage.getItem("token");


// Make sure user is logged in
if (!token) {
    window.location.href = "login.html";
}


function toggleRecurring() {

    const checkbox =
        document.getElementById("recurring");

    const options =
        document.getElementById(
            "recurringOptions"
        );

    if (checkbox.checked) {

        options.style.display = "block";

    } else {

        options.style.display = "none";

    }
}


async function createList() {

    const name =
        document.getElementById("listName").value.trim();

    const recurring =
        document.getElementById("recurring").checked;

    const recurringFrequency =
        document.getElementById(
            "recurringFrequency"
        ).value;

    const budget =
        document.getElementById("budget").value;


    if (!name) {

        document.getElementById("message").innerText =
            "Please enter a list name.";

        return;
    }


    try {

        const response = await fetch(
            `${import.meta.env.VITE_API_URL}/api/lists`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",

                    "Authorization":
                        `Bearer ${token}`
                },

                body: JSON.stringify({

                    name: name,

                    recurring: recurring,

                    recurringFrequency:
                        recurring
                            ? recurringFrequency
                            : "none",

                    budget:
                        Number(budget) || 0

                })
            }
        );


        const data =
            await response.json();


        if (!response.ok) {

            document.getElementById(
                "message"
            ).innerText =
                data.message || "Failed to create list.";

            return;
        }


        document.getElementById(
            "message"
        ).innerText =
            "Shopping list created!";


        setTimeout(() => {

            window.location.href =
                "lists.html";

        }, 700);


    } catch (error) {

        console.error(error);

        document.getElementById(
            "message"
        ).innerText =
            "Could not connect to server.";

    }

}