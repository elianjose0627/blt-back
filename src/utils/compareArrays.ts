const compareArrays = (a: any[], b: any[]): boolean => {
  return (
    a.length === b.length &&
      a.every((elementOne) =>
        b.some((elementTwo) =>
          Object.keys(elementOne).every((key) => elementOne[key] === elementTwo[key])
        )
      )
  )
}

export default compareArrays
