import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Link,
} from '@react-email/components';

interface VerificationEmailProps {
  username: string;
  otp: string;
}

export const VerificationEmail: React.FC<Readonly<VerificationEmailProps>> = ({
  username,
  otp,
}) => (
  <Html>
    <Head />
    <Preview>Verify your email address</Preview>
    <Body style={bodyStyle}>
      <Container style={containerStyle}>
        <Heading style={headingStyle}>Welcome to dBKash!</Heading>
        <Section style={sectionStyle}>
          <Text style={textStyle}>
            Hello {username},
          </Text>
          <Text style={textStyle}>
            Thank you for joining dBKash. To complete your registration, please verify your email address:
          </Text>
          <Text style={textStyle}>
            Your verification code is:
          </Text>
          <Text style={otpStyle}>
            {otp}
          </Text>
          <Text style={textStyle}>
            Please enter this code on the verification page to confirm your email address.
          </Text>
          <Text style={textStyle}>
            If you didn't create an account, you can safely ignore this email.
          </Text>
        </Section>
        <Section style={footerStyle}>
          <Text style={footerTextStyle}>
            Thanks for joining dBKash!
          </Text>
          <Text style={footerTextStyle}>
            - Rohit Sen, Founder
          </Text>
          <Text style={footerTextStyle}>
            <Link href="https://www.linkedin.com/in/rohit-sen-3a010019b" style={linkStyle}>
              Connect with me on LinkedIn
            </Link>
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

const bodyStyle: React.CSSProperties = {
  backgroundColor: '#f6f9fc',
  fontFamily: 'Arial, sans-serif',
};

const containerStyle: React.CSSProperties = {
  margin: '0 auto',
  padding: '20px 0 48px',
  width: '580px',
};

const headingStyle: React.CSSProperties = {
  fontSize: '36px',
  fontWeight: 'bold',
  textAlign: 'center',
  margin: '20px 0',
  color: '#007bff',
};

const sectionStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  border: '1px solid #e0e0e0',
  borderRadius: '8px',
  padding: '30px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.05)',
};

const textStyle: React.CSSProperties = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#333333',
};


const otpStyle: React.CSSProperties = {
  fontSize: '40px',
  fontWeight: 'bold',
  textAlign: 'center',
  margin: '20px 0',
  color: '#007bff',
};

const footerStyle: React.CSSProperties = {
  marginTop: '40px',
  paddingTop: '20px',
  borderTop: '1px solid #e0e0e0',
  textAlign: 'center',
};

const footerTextStyle: React.CSSProperties = {
  fontSize: '14px',
  lineHeight: '22px',
  color: '#555555',
};

const linkStyle: React.CSSProperties = {
  color: '#007bff',
  textDecoration: 'none',
};

export default VerificationEmail;
