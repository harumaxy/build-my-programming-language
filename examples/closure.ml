// クロージャのデモ
fn makeCounter() {
  let count = 0;
  return fn() {
    count = count + 1;
    return count;
  };
}

let counter1 = makeCounter();
let counter2 = makeCounter();

print(counter1()); // 1
print(counter1()); // 2
print(counter1()); // 3

print(counter2()); // 1 (独立したカウンター)
print(counter2()); // 2
