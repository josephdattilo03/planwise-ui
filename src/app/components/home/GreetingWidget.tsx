import { Box, Typography } from "@mui/material";
import AppsIcon from "@mui/icons-material/Apps";

interface GreetingWidgetProps {
  userName: string;
}

export default function GreetingWidget({ userName }: GreetingWidgetProps) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        color: "var(--dark-green-1)",
        fontWeight: "bold",
        mt: 2,
        mb: 1,
        ml: 1.5,
      }}
    >
      <Typography
        variant="h2"
        sx={{
          color: "var(--dark-green-1)",
          fontWeight: "bold",
          mb: 0,
          textAlign: "left",
          fontSize: { xs: "1.5rem", sm: "2rem", md: "2.25rem" },
        }}
      >
        Hi, {userName}!
      </Typography>
      <AppsIcon
        sx={{
          fontSize: { xs: 20, sm: 24 },
          cursor: "pointer",
          transition: "all 0.2s ease",
          "&:hover": {
            transform: "scale(1.1)",
            opacity: 0.8,
          },
        }}
        onClick={() => {
          // TODO: Add apps menu functionality
        }}
      />
    </Box>
  );
}
