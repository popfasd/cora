/*
 * Dummy data for cora testing
 */
cora.DummyData = {
	students: [
		{firstName: 'Beverly', lastName: 'Twigg'},
		{firstName: 'Edward', lastName: 'Ham'},
		{firstName: 'Vincent', lastName: 'Mckoy'},
		{firstName: 'Travis', lastName: 'Maguire'},
		{firstName: 'Celia', lastName: 'Coffery'},
		{firstName: 'Kathleen', lastName: 'Victor'},
		{firstName: 'Fred', lastName: 'Dufour'},
		{firstName: 'Glenn', lastName: 'Livengood'},
		{firstName: 'Michael', lastName: 'Rager'},
		{firstName: 'Mark', lastName: 'Tolbert'},
		{firstName: 'Chad', lastName: 'Quintero'},
		{firstName: 'Justin', lastName: 'Chad'},
		{firstName: 'Heather', lastName: 'Faison'},
		{firstName: 'George', lastName: 'Chitwood'},
		{firstName: 'Jo', lastName: 'Valera'},
		{firstName: 'Faye', lastName: 'Blythe'},
		{firstName: 'Jerry', lastName: 'Seale'},
		{firstName: 'Marlene', lastName: 'Mccormick'},
		{firstName: 'Jerry', lastName: 'Collin'},
		{firstName: 'Charles', lastName: 'Mcnamara'},
		{firstName: 'Benjamin', lastName: 'Mauney'},
		{firstName: 'Julia', lastName: 'Darden'},
		{firstName: 'Ida', lastName: 'Phelps'},
		{firstName: 'Gertrude', lastName: 'Hefner'},
		{firstName: 'Brandon', lastName: 'Bergeron'},
		{firstName: 'Marvin', lastName: 'Hulse'},
		{firstName: 'Harriet', lastName: 'Cotter'},
		{firstName: 'Genevieve', lastName: 'Devaney'},
		{firstName: 'Tanya', lastName: 'Cotton'}
		],
	
	load: function ( callback )
	{		
		for (var i=0; i<this.students.length; i++)
		{
			cora.persistence.add(new cora.Student(this.students[i]));
		}
		
		cora.persistence.flush(callback);
	}
};