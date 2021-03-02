let giftLevels: { id: number; pointsNeeded: number; collectionId: number }[];

if (process.env.NODE_ENV === 'points-development') {
  giftLevels = [
    {
      id: 1,
      pointsNeeded: 400,
      collectionId: 238692630688,
    },
    {
      id: 2,
      pointsNeeded: 800,
      collectionId: 238692663456,
    },
    {
      id: 3,
      pointsNeeded: 1200,
      collectionId: 238692728992,
    },
  ];
} else {
  giftLevels = [
    {
      id: 1,
      pointsNeeded: 400,
      collectionId: 167062569027,
    },
    {
      id: 2,
      pointsNeeded: 800,
      collectionId: 167062601795,
    },
    {
      id: 3,
      pointsNeeded: 1200,
      collectionId: 167063060547,
    },
  ];
}

export { giftLevels };
