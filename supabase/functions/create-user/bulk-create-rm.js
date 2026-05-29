const users = [
    {
      username: "Tamnna Chaudhary",
      email: "tamnna.chaudhary@prosperr.io",
    },
    {
      username: "Rittika Maity",
      email: "rittika.maity@prosperr.io",
    },
    {
      username: "Supriya",
      email: "supriya.r@prosperr.io",
    },
    {
      username: "Karan pandey",
      email: "karan.pandey@prosperr.io",
    },
    {
      username: "Sumit Kumar Chaudhary",
      email: "sumit.k@prosperr.io",
    },
    {
      username: "Rohith V",
      email: "rohith.v@prosperr.io",
    },
    {
      username: "Enika Sahu",
      email: "enika.sahu@prosperr.io",
    },
    {
      username: "Arun N",
      email: "arun.n@prosperr.io",
    },
    {
      username: "Akshay",
      email: "akshay@prosperr.io",
    },
    {
      username: "Treyashi Saha",
      email: "treyashi.s@prosperr.io",
    },
  ];
  
  const TEAM_ID = "786af9e0-2c45-4a55-9450-62b995be9735";
  
  async function createUsers() {
    const session = JSON.parse(localStorage.getItem("supabase.auth.token"));
  
    const token = session?.currentSession?.access_token;
  
    for (const user of users) {
      try {
        const res = await fetch(
          "https://pimnifngytxdzdjbghor.supabase.co/functions/v1/create-user",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              email: user.email,
              username: user.username,
              team_id: TEAM_ID,
              is_admin: false,
            }),
          }
        );
  
        const data = await res.json();
  
        console.log(user.email, data);
      } catch (err) {
        console.error(user.email, err);
      }
    }
  }
  
  createUsers();