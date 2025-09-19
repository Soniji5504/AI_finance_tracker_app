import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

export default function EmailTemplate({ data, type }) {
  return (
    <Html>
      <Head />
      <Preview>
        {type === "monthly-report"
          ? "Your Monthly Finance Report"
          : "Budget Alert"}
      </Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Heading style={styles.heading}>
            {type === "monthly-report"
              ? "📊 Monthly Finance Report"
              : "⚠️ Budget Alert"}
          </Heading>
          <Hr style={styles.hr} />

          {type === "monthly-report" ? (
            <>
              <Section>
                <Text style={styles.subheading}>Income</Text>
                <Text style={styles.heading}>
                  ${data?.stats?.totalIncome ?? 0}
                </Text>
              </Section>
              <Section>
                <Text style={styles.subheading}>Expenses</Text>
                <Text style={styles.heading}>
                  ${data?.stats?.totalExpenses ?? 0}
                </Text>
              </Section>
              <Section>
                <Text style={styles.subheading}>Net Savings</Text>
                <Text style={styles.heading}>
                  $
                  {(data?.stats?.totalIncome ?? 0) -
                    (data?.stats?.totalExpenses ?? 0)}
                </Text>
              </Section>
            </>
          ) : (
            <>
              <Section>
                <Text style={styles.subheading}>Budget Limit</Text>
                <Text style={styles.heading}>
                  ${data?.budgetLimit ?? 0}
                </Text>
              </Section>
              <Section>
                <Text style={styles.subheading}>Current Expenses</Text>
                <Text style={styles.heading}>
                  ${data?.currentExpenses ?? 0}
                </Text>
              </Section>
              <Section>
                <Text style={styles.subheading}>Over Limit By</Text>
                <Text style={styles.heading}>
                  ${(data?.currentExpenses ?? 0) - (data?.budgetLimit ?? 0)}
                </Text>
              </Section>
            </>
          )}
        </Container>
      </Body>
    </Html>
  );
}

const styles = {
  body: {
    backgroundColor: "#f4f4f4",
    padding: "20px",
  },
  container: {
    backgroundColor: "#ffffff",
    padding: "20px",
    borderRadius: "8px",
  },
  heading: {
    fontSize: "20px",
    fontWeight: "bold",
  },
  subheading: {
    fontSize: "16px",
    fontWeight: "500",
  },
  hr: {
    borderColor: "#cccccc",
    margin: "20px 0",
  },
};
