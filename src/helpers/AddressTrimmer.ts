export const addressTrimmer = (address: string | null) => {
    return address
      ? `${address.slice(0, 4)}...${address.slice(-3)}`.toLowerCase()
      : null;
  };