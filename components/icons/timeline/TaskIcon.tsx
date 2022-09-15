import TaskDoneIcon from './TaskDoneIcon';
import TaskUndoneIcon from './TaskUndoneIcon';

interface Props {
  isDone: boolean;
}

function TaskIcon({ isDone }: Props) {
  return isDone ? <TaskDoneIcon /> : <TaskUndoneIcon />;
}

export default TaskIcon;
