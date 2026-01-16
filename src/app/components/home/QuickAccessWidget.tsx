import { Box, Card, CardContent, Typography } from "@mui/material";
import { useRouter } from "next/navigation";

export default function QuickAccessWidget() {
  const router = useRouter();

  return (
    <Card
      sx={{
        borderRadius: "20px",
        border: "2px solid var(--green-3)",
        backgroundColor: "#f7f9f3",
      }}
      elevation={2}
    >
      <CardContent sx={{ p: 3 }}>
        <Typography
          variant="body2"
          sx={{
            color: "var(--dark-green-2)",
            lineHeight: 1.4,
            mb: 2,
            fontSize: 20,
            textAlign: "center",
            fontWeight: "bold",
          }}
        >
          Welcome to your dashboard,
          <br />
          let's get things done today ☺
        </Typography>

        <Typography
          variant="h6"
          sx={{
            mb: 1.5,
            fontWeight: 600,
            color: "var(--dark-green-1)",
            fontSize: "1rem",
          }}
        >
          Quick Access
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {[
            { name: "Senior Design", boardId: "board-1", description: "Click to access board" },
            { name: "My Workspace", boardId: null, description: "Click to access workspace" }
          ].map((item) => (
            <Box
              key={item.name}
              onClick={() => {
                if (item.boardId) {
                  router.push(`/folders?board=${item.boardId}`);
                } else {
                  router.push("/folders");
                }
              }}
              sx={{
                cursor: "pointer",
                p: 2,
                borderRadius: 2,
                backgroundColor: "#fff",
                border: "1px solid rgba(0,0,0,0.08)",
                transition: "all 0.2s ease",
                "&:hover": {
                  boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
                  transform: "translateY(-1px)",
                },
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--dark-green-1)",
                  mb: 0.5,
                }}
              >
                {item.name}
              </Typography>
              <Typography
                variant="caption"
                sx={{ fontSize: 14, color: "var(--dark-green-2)" }}
              >
                {item.description}
              </Typography>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}
