var solvers = [/* deprecated {
  "abbr": "SPECFEM3D_CARTESIAN_21447",
  "name": "SPECFEM3D_CARTESIAN_21447",
  "doc": "https://github.com/geodynamics/specfem3d/raw/devel/doc/USER_MANUAL/manual_SPECFEM3D_Cartesian.pdf"
},*/
     {
	   "abbr": "SPECFEM3D_CARTESIAN_NEW",
	   "name": "SPECFEM3D_CARTESIAN_NEW",
	   "doc": "https://github.com/geodynamics/specfem3d/raw/devel/doc/USER_MANUAL/manual_SPECFEM3D_Cartesian.pdf"
	 },
	 {
	  "abbr": "SPECFEM3D_CARTESIAN_202_DEV",
	  "name": "SPECFEM3D_CARTESIAN_202_DEV",
	  "doc": "https://github.com/geodynamics/specfem3d/raw/devel/doc/USER_MANUAL/manual_SPECFEM3D_Cartesian.pdf"
	},
	{
		"abbr": "SPECFEM3D_GLOBE",
		"name": "SPECFEM3D_GLOBE",
		"doc": "https://github.com/geodynamics/specfem3d_globe/raw/master/doc/USER_MANUAL/manual_SPECFEM3D_GLOBE.pdf"
	}];

Ext.define('CF.store.Solver', {
  extend: 'Ext.data.Store',
  model: 'CF.model.Solver',
  data: solvers
});