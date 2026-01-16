import { Box, Card, CardContent, Typography, Button } from "@mui/material";
import { useRouter } from "next/navigation";

export default function ScheduleAlertWidget() {
  const router = useRouter();

  return (
    <Card
      sx={{
        mt: 2,
        borderRadius: "20px",
        background: "linear-gradient(135deg, #ffe1c4, #ffd0bf)",
        border: "2px solid rgba(122, 58, 0, 0.2)",
        maxHeight: "200px",
        overflow: "hidden",
      }}
      elevation={3}
    >
      <CardContent sx={{ p: 3, pb: 2 }}>
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, color: "#7a3a00", mb: 1, fontSize: "1rem" }}
        >
          ⚠️ Schedule Alert
        </Typography>

        <Typography
          variant="body2"
          sx={{
            mb: 2,
            color: "#6b3a17",
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
            backgroundColor: "#e65c2c",
            py: 1.5,
            fontSize: 13,
            fontWeight: 600,
            "&:hover": { backgroundColor: "#d24f21" },
          }}
          onClick={() => router.push("/calendar")}
        >
          See Details
        </Button>
      </CardContent>
    </Card>
  );
}
