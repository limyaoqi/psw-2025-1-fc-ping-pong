interface Props {
    username: string;
  }
  
  export default function UserGreeting({ username }: Props) {
    return <span className="text-sm font-medium hidden md:inline-block">Hi, {username}</span>;
  }
  