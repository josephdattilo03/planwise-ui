import { Box, Card, CardContent, Typography, Button } from "@mui/material";
import { useRouter } from "next/navigation";

export default function ScheduleAlertWidget() {
  const router = useRouter();

  return (
    <Card
      sx={{
        mt: 2,
        borderRadius: "20px",
        background: "linear-gradient(135deg, var(--home-alert-bg-1), var(--home-alert-bg-2))",
        border: "1px solid var(--home-alert-border)",
        maxHeight: "200px",
        overflow: "hidden",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      }}
      elevation={0}
    >
      <CardContent sx={{ p: 3, pb: 2 }}>
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, color: "var(--home-alert-title)", mb: 1, fontSize: "1rem" }}
        >
          ⚠️ Schedule Alert
        </Typography>

        <Typography
          variant="body2"
          sx={{
            mb: 2,
            color: "var(--home-alert-text)",
            lineHeight: 1.4,
            fontSize: "0.875rem",
          }}
        >
          Your schedule for the next 10 days looks busy. Take care!
        </Typography>

        <Button
          variant="contained"
          fullWidth
          sx={{
            textTransform: "none",
            borderRadius: 999,
            backgroundColor: "var(--home-alert-button)",
            py: 1.5,
            fontSize: 13,
            fontWeight: 600,
            "&:hover": { backgroundColor: "var(--home-alert-button-hover)" },
          }}
          onClick={() => router.push("/calendar")}
        >
          See Details
        </Button>
      </CardContent>
    </Card>
  );
}
