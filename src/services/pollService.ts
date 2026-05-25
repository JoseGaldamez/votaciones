import { 
  collection, query, orderBy, onSnapshot, doc, updateDoc, 
  addDoc, setDoc, serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';

export interface Option {
  id: string;
  name: string;
}

export interface Poll {
  id: string;
  title: string;
  description: string;
  creatorId: string;
  creatorName: string;
  creatorEmail: string;
  status: 'active' | 'ended';
  createdAt: any;
  endedAt: any | null;
  options: Option[];
}

export interface Vote {
  userId: string;
  userName: string;
  optionId: string;
  votedAt: any;
}

/**
 * Suscribe a los cambios de todas las votaciones en tiempo real (ordenadas por fecha descendente).
 */
export const subscribeToPolls = (
  onData: (polls: Poll[]) => void,
  onError?: (error: any) => void
): (() => void) => {
  const pollsQuery = query(collection(db, 'polls'), orderBy('createdAt', 'desc'));
  
  return onSnapshot(
    pollsQuery,
    (snapshot) => {
      const pollsList: Poll[] = [];
      snapshot.forEach((docSnap) => {
        pollsList.push({
          id: docSnap.id,
          ...docSnap.data()
        } as Poll);
      });
      onData(pollsList);
    },
    (error) => {
      console.error('Error in subscribeToPolls:', error);
      if (onError) onError(error);
    }
  );
};

/**
 * Suscribe a los cambios de una única votación en tiempo real.
 */
export const subscribeToPoll = (
  pollId: string,
  onData: (poll: Poll) => void,
  onError?: (error: any) => void
): (() => void) => {
  const pollRef = doc(db, 'polls', pollId);
  
  return onSnapshot(
    pollRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onData({ id: snapshot.id, ...snapshot.data() } as Poll);
      } else {
        if (onError) onError(new Error('La votación no existe.'));
      }
    },
    (error) => {
      console.error(`Error in subscribeToPoll (${pollId}):`, error);
      if (onError) onError(error);
    }
  );
};

/**
 * Suscribe al voto emitido por el usuario en tiempo real.
 */
export const subscribeToUserVote = (
  pollId: string,
  userId: string,
  onData: (vote: Vote | null) => void,
  onError?: (error: any) => void
): (() => void) => {
  const voteRef = doc(db, 'polls', pollId, 'votes', userId);
  
  return onSnapshot(
    voteRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onData(snapshot.data() as Vote);
      } else {
        onData(null);
      }
    },
    (error) => {
      console.error(`Error in subscribeToUserVote (${pollId}, ${userId}):`, error);
      if (onError) onError(error);
    }
  );
};

/**
 * Suscribe a todos los votos emitidos para una votación en tiempo real.
 */
export const subscribeToAllVotes = (
  pollId: string,
  onData: (votes: Vote[]) => void,
  onError?: (error: any) => void
): (() => void) => {
  const votesRef = collection(db, 'polls', pollId, 'votes');
  
  return onSnapshot(
    votesRef,
    (snapshot) => {
      const votesList: Vote[] = [];
      snapshot.forEach((docSnap) => {
        votesList.push(docSnap.data() as Vote);
      });
      onData(votesList);
    },
    (error) => {
      console.error(`Error in subscribeToAllVotes (${pollId}):`, error);
      if (onError) onError(error);
    }
  );
};

/**
 * Crea una nueva votación en Firestore con sus opciones correspondientes.
 */
export const createPoll = async (
  title: string,
  description: string,
  creatorId: string,
  creatorName: string,
  creatorEmail: string,
  optionsNames: string[]
): Promise<string> => {
  const pollData = {
    title,
    description,
    creatorId,
    creatorName,
    creatorEmail,
    status: 'active' as const,
    createdAt: serverTimestamp(),
    endedAt: null,
    options: optionsNames.map((name, index) => ({
      id: `opt_${Date.now()}_${index}`,
      name,
    })),
  };

  const docRef = await addDoc(collection(db, 'polls'), pollData);
  return docRef.id;
};

/**
 * Cierra una votación activa (pasa su estado a Terminada).
 */
export const closePoll = async (pollId: string): Promise<void> => {
  const pollRef = doc(db, 'polls', pollId);
  await updateDoc(pollRef, {
    status: 'ended',
    endedAt: serverTimestamp(),
  });
};

/**
 * Registra un voto para un usuario en una votación específica de forma atómica.
 */
export const castVote = async (
  pollId: string,
  userId: string,
  userName: string,
  optionId: string
): Promise<void> => {
  const voteRef = doc(db, 'polls', pollId, 'votes', userId);
  const voteData: Vote = {
    userId,
    userName,
    optionId,
    votedAt: serverTimestamp(),
  };
  await setDoc(voteRef, voteData);
};
