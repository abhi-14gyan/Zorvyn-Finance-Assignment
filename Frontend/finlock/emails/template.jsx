import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

export default function EmailTemplate({
  userName = "",
  type = "budget-alert",
  data = {},
}) {
  if (type === "budget-alert") {
    return (
      <Html>
        <Head />
        <Preview>Finlock Budget Alert</Preview>
        <Body style={styles.body}>
          <Container style={styles.container}>
            <Heading style={styles.title}>⚠ Budget Alert from Finlock</Heading>
            <Text style={styles.text}>Hello <strong>{userName}</strong>,</Text>
            <Text style={styles.text}>
              You've used <strong>{data?.percentageUsed.toFixed(1)}%</strong> of your monthly budget.
              Your financial wellness is important to us — here's a breakdown of your spending:
            </Text>

            <Section style={styles.statsSection}>
              <div style={styles.stat}>
                <Text style={styles.statLabel}>💰 Budget Limit</Text>
                <Text style={styles.statValue}>₹ {data?.budgetAmount}</Text>
              </div>
              <div style={styles.stat}>
                <Text style={styles.statLabel}>🧾 Spent So Far</Text>
                <Text style={styles.statValue}>₹ {data?.totalExpenses}</Text>
              </div>
              <div style={styles.stat}>
                <Text style={styles.statLabel}>📉 Remaining</Text>
                <Text style={styles.statValue}>
                  ₹ {data?.budgetAmount - data?.totalExpenses}
                </Text>
              </div>
            </Section>

            <Text style={{ ...styles.text, marginTop: "20px" }}>
              To maintain your financial goals, we recommend reviewing your expenses and adjusting accordingly.
            </Text>

            <Button
              href="http://localhost:3001/dashboard"
              style={styles.button}
            >
              View My Dashboard
            </Button>

            <Text style={styles.footer}>
              You're receiving this email because you have an active budget set on Finlock.
              <br />
              © {new Date().getFullYear()} Finlock | India's Premium Financial Companion
            </Text>
          </Container>
        </Body>
      </Html>
    );
  }
}
const styles = {
  body: {
    backgroundColor: "#f1f5f9",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    padding: "40px 0",
  },
  container: {
    backgroundColor: "#ffffff",
    borderRadius: "10px",
    padding: "40px",
    maxWidth: "600px",
    margin: "auto",
    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.1)",
    border: "1px solid #e2e8f0",
  },
  title: {
    fontSize: "28px",
    fontWeight: "bold",
    color: "#1e293b", // Dark navy
    textAlign: "center",
    marginBottom: "24px",
  },
  text: {
    fontSize: "16px",
    color: "#334155",
    lineHeight: "1.6",
    marginBottom: "16px",
  },
  statsSection: {
    marginTop: "24px",
    backgroundColor: "#f9fafb",
    padding: "24px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
  },
  stat: {
    marginBottom: "16px",
  },
  statLabel: {
    fontSize: "14px",
    color: "#64748b",
    marginBottom: "4px",
  },
  statValue: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#0f172a",
  },
  button: {
    marginTop: "24px",
    backgroundColor: "#1e293b",
    color: "#fff",
    padding: "12px 24px",
    borderRadius: "6px",
    fontSize: "16px",
    textDecoration: "none",
    textAlign: "center",
    display: "inline-block",
  },
  footer: {
    fontSize: "12px",
    color: "#94a3b8",
    marginTop: "32px",
    textAlign: "center",
    lineHeight: "1.5",
  },
};
