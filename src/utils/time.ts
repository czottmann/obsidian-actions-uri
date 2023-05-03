export async function pause(milliseconds: number): Promise<void> {
  return new Promise<void>((resolve) => {
    setTimeout(
      () => resolve(),
      milliseconds,
    );
  });
}
