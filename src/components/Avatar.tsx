import { avatarColor, initials } from "@/lib/points";

export function Avatar({ name, large }: { name: string; large?: boolean }) {
  return (
    <div className={"avatar" + (large ? " avatar-lg" : "")} style={{ background: avatarColor(name) }}>
      {initials(name)}
    </div>
  );
}
