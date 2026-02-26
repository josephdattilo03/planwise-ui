import { Box, Card, CardContent, Typography } from "@mui/material";
import { useRouter } from "next/navigation";

export default function QuickAccessWidget() {
  const router = useRouter();

  return (
    <Card
      sx={{
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--card-border)",
        backgroundColor: "var(--home-quick-bg)",
      }}
      elevation={0}
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
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--menu-bg)",
                border: "1px solid var(--card-border)",
                transition: "all 0.2s ease",
                "&:hover": {
                  transform: "translateY(-1px)",
                  backgroundColor: "var(--menu-item-hover)",
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
