import { Box, Card, CardContent, Typography } from "@mui/material";
import { useRouter } from "next/navigation";

import type { Board } from "../../types/board";

function isVirtualCalendarBoard(b: Board): boolean {
  return b.id.startsWith("gcal:");
}

interface QuickAccessWidgetProps {
  boards: Board[];
}

export default function QuickAccessWidget({ boards }: QuickAccessWidgetProps) {
  const router = useRouter();
  const realBoards = boards.filter((b) => !isVirtualCalendarBoard(b)).slice(0, 5);

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
          let&apos;s get things done today ☺
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
          {realBoards.map((board) => (
            <Box
              key={board.id}
              onClick={() => router.push(`/folders?board=${encodeURIComponent(board.id)}`)}
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
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    flexShrink: 0,
                    backgroundColor: board.color || "var(--green-2)",
                  }}
                  aria-hidden
                />
                <Box>
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "var(--dark-green-1)",
                      mb: 0.5,
                    }}
                  >
                    {board.name}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ fontSize: 13, color: "var(--dark-green-2)" }}
                  >
                    Open folders for this board
                  </Typography>
                </Box>
              </Box>
            </Box>
          ))}

          <Box
            onClick={() => router.push("/folders")}
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
              All workspaces
            </Typography>
            <Typography variant="caption" sx={{ fontSize: 13, color: "var(--dark-green-2)" }}>
              Browse folders and boards
            </Typography>
          </Box>

          {realBoards.length === 0 && (
            <Typography variant="caption" sx={{ color: "var(--dark-green-2)", fontStyle: "italic" }}>
              Create a board in the app to see shortcuts here.
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
