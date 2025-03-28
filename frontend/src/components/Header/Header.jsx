import React from 'react';

function Header() {
  const handleTitleClick = () => {
    alert('Welcome to TravelEasy!');
  };

  return (
    <header style={styles.header}>
      <h1 
        style={styles.title} 
        onClick={handleTitleClick} 
      >
        TravelEasy
      </h1>
    </header>
  );
}

const styles = {
  header: {
    backgroundColor: '#4CAF50',
    padding: '10px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',           // Full width of the page
    cursor: 'pointer',
  },
  title: {
    color: '#fff',
    margin: 0,
    fontSize: '36px',
    fontFamily: `'Courier New', Courier, monospace`,
    transition: 'color 0.3s ease',
  },
};

export default Header;
